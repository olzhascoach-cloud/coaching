#!/usr/bin/env bash
# bootstrap-vps.sh — one-time provisioning for the static-sites VPS.
# Idempotent: safe to re-run.
#
# Usage (on the VPS as a sudoer):
#   sudo ./bootstrap-vps.sh <admin-email>
#
# <admin-email> is used by certbot for cert expiry notifications.

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "bootstrap-vps: must run as root (use sudo)" >&2
    exit 1
fi

ADMIN_EMAIL="${1:-}"
SKIP_CERTBOT="${SKIP_CERTBOT:-0}"
if [[ -z "$ADMIN_EMAIL" && "$SKIP_CERTBOT" != "1" ]]; then
    echo "Usage: sudo $0 <admin-email>" >&2
    echo "       sudo SKIP_CERTBOT=1 $0       (run steps 1-11 only, skip TLS issuance)" >&2
    exit 1
fi

DOMAINS=("olzhas-coach.kz" "parusa.kz")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
NGINX_SRC="$REPO_DIR/infra/nginx"

echo "==> 1. Updating package index and upgrading"
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> 2. Installing required packages"
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nginx \
    certbot \
    python3-certbot-nginx \
    rsync \
    ufw \
    fail2ban \
    unattended-upgrades

echo "==> 3. Enabling unattended security upgrades"
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> 4. Configuring UFW firewall"
# NOTE: --force reset drops all rules briefly. Keep the reset/allow/enable
# lines sequential — do not insert slow commands between them.
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

echo "==> 5. Enabling fail2ban"
systemctl enable --now fail2ban

echo "==> 6. Creating deploy user"
if ! id deploy >/dev/null 2>&1; then
    useradd --create-home --shell /bin/bash deploy
fi
install -d -o deploy -g deploy -m 700 /home/deploy/.ssh

echo "==> 7. Generating deploy SSH keypair (if missing)"
DEPLOY_KEY=/home/deploy/.ssh/id_ed25519
if [[ ! -f "$DEPLOY_KEY" ]]; then
    sudo -u deploy ssh-keygen -t ed25519 -N "" -C "deploy@$(hostname)" -f "$DEPLOY_KEY"
fi

echo "==> 8. Creating site directory layout"
for d in "${DOMAINS[@]}"; do
    for env in prod preview; do
        install -d -o deploy -g deploy -m 755 "/var/www/sites/$d/$env/releases"
        # Initial placeholder release so nginx has something to serve
        if [[ ! -L "/var/www/sites/$d/$env/current" ]]; then
            PLACEHOLDER="/var/www/sites/$d/$env/releases/0000-00-00_000000"
            install -d -o deploy -g deploy -m 755 "$PLACEHOLDER"
            cat > "$PLACEHOLDER/index.html" <<HTML
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>$d ($env)</title></head>
<body><h1>$d ($env)</h1><p>Coming soon.</p></body></html>
HTML
            chown -R deploy:deploy "$PLACEHOLDER"
            ln -sfn "$PLACEHOLDER" "/var/www/sites/$d/$env/current"
        fi
    done
done

echo "==> 9. Installing nginx server-block configs"
for d in "${DOMAINS[@]}"; do
    install -m 644 "$NGINX_SRC/$d.conf" "/etc/nginx/sites-available/$d.conf"
    ln -sfn "/etc/nginx/sites-available/$d.conf" "/etc/nginx/sites-enabled/$d.conf"
done
# Disable the default site if present
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> 10. Installing deploy-receive.sh"
install -m 755 -o root -g root "$SCRIPT_DIR/deploy-receive.sh" /usr/local/bin/deploy-receive.sh

echo "==> 11. Configuring authorized_keys for deploy user"
# Restrict the deploy SSH key to a wrapper that only permits the rsync receiver
# and our deploy-receive.sh script. Anything else is rejected.
AUTH_KEYS=/home/deploy/.ssh/authorized_keys
PUB_KEY="$(cat /home/deploy/.ssh/id_ed25519.pub)"
RESTRICT='command="/usr/local/bin/deploy-ssh-wrapper.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,restrict'

cat > /usr/local/bin/deploy-ssh-wrapper.sh <<'WRAPPER'
#!/usr/bin/env bash
set -euo pipefail
# Disable pathname expansion so attacker-controlled glob characters in
# SSH_ORIGINAL_COMMAND (e.g. /etc/pass*) cannot expand against the filesystem.
set -f
case "${SSH_ORIGINAL_COMMAND:-}" in
    "rsync --server"*)
        # shellcheck disable=SC2086
        exec $SSH_ORIGINAL_COMMAND
        ;;
    "/usr/local/bin/deploy-receive.sh "*)
        # shellcheck disable=SC2086
        exec $SSH_ORIGINAL_COMMAND
        ;;
    *)
        echo "deploy-ssh-wrapper: rejected command: ${SSH_ORIGINAL_COMMAND:-<empty>}" >&2
        exit 1
        ;;
esac
WRAPPER
chmod 755 /usr/local/bin/deploy-ssh-wrapper.sh
chown root:root /usr/local/bin/deploy-ssh-wrapper.sh

echo "$RESTRICT $PUB_KEY" > "${AUTH_KEYS}.tmp"
chown deploy:deploy "${AUTH_KEYS}.tmp"
chmod 600 "${AUTH_KEYS}.tmp"
mv -f "${AUTH_KEYS}.tmp" "$AUTH_KEYS"

if [[ "$SKIP_CERTBOT" == "1" ]]; then
    echo "==> 12. Skipping TLS certificate issuance (SKIP_CERTBOT=1)"
    echo "    Re-run with: sudo $0 <admin-email>   once DNS is configured."
else
    echo "==> 12. Issuing TLS certificates with certbot"
    for d in "${DOMAINS[@]}"; do
        if [[ ! -d "/etc/letsencrypt/live/$d" ]]; then
            certbot --nginx \
                -d "$d" -d "www.$d" -d "preview.$d" \
                --non-interactive --agree-tos -m "$ADMIN_EMAIL" \
                --redirect
        else
            echo "    cert for $d already exists, skipping"
        fi
    done
fi

systemctl reload nginx

echo ""
echo "================================================================"
echo "Bootstrap complete."
echo ""
echo "Add these to GitHub repo secrets:"
echo "  VPS_HOST           = $(curl -fsS https://api.ipify.org || echo 'FAILED — set manually')"
echo "  VPS_USER           = deploy"
echo "  VPS_SSH_KEY        = (contents of $DEPLOY_KEY — copy carefully)"
KNOWN_HOSTS="$(ssh-keyscan -t ed25519 localhost 2>/dev/null | sed "s/localhost/$(hostname -I | awk '{print $1}')/" || true)"
echo "  VPS_SSH_KNOWN_HOSTS = ${KNOWN_HOSTS:-FAILED — run: ssh-keyscan -t ed25519 <VPS_IP>}"
echo ""
echo "Verify with:"
for d in "${DOMAINS[@]}"; do
    echo "  curl -I https://$d"
    echo "  curl -I https://preview.$d"
done
echo "================================================================"
