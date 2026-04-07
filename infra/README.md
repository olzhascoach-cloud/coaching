# Operator notes — VPS infrastructure

This directory holds the infrastructure-as-code for the static-sites VPS. **The friend never reads this file.** It's for Roman (and any future developer doing admin work).

## VPS

- **Host:** `194.32.142.140`
- **OS:** Ubuntu (whatever LTS the provider gave us)
- **Admin user:** `ubuntu` (sudo, key-based)
- **Deploy user:** `deploy` (no sudo, restricted SSH command, used by GitHub Actions)

## One-time bootstrap

On a fresh VPS:

1. SSH in as `ubuntu`: `ssh ubuntu@194.32.142.140`
2. Clone this repo: `git clone https://github.com/<owner>/<repo>.git ~/sites && cd ~/sites`
3. Make sure DNS A records for both domains (`@`, `www`, `preview`) point to the VPS IP. Verify with `dig olzhas-coach.kz +short`.
4. Run the bootstrap as root: `sudo ./infra/scripts/bootstrap-vps.sh you@example.com`
5. The script prints what to copy into GitHub repo secrets. Copy them.

The script is idempotent — re-running it on a half-configured server completes the missing steps without breaking working ones.

## GitHub repo secrets to set

| Name | Value |
|---|---|
| `VPS_HOST` | `194.32.142.140` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Contents of `/home/deploy/.ssh/id_ed25519` from the VPS (the private key) |
| `VPS_SSH_KNOWN_HOSTS` | Output of `ssh-keyscan -t ed25519 194.32.142.140` (the host fingerprint) |

## GitHub branch protection

- **`main`:** require pull request before merging (or restrict push to a specific GitHub user); block force-push; block deletion
- **`preview`:** block force-push; block deletion; allow push

## File layout on VPS

```
/var/www/sites/
├── olzhas-coach.kz/
│   ├── prod/{current → releases/<ts>, releases/}
│   └── preview/{current → releases/<ts>, releases/}
└── parusa.kz/
    ├── prod/{current → releases/<ts>, releases/}
    └── preview/{current → releases/<ts>, releases/}

/etc/nginx/sites-available/
├── olzhas-coach.kz.conf  (mirrors infra/nginx/, modified by certbot)
└── parusa.kz.conf

/usr/local/bin/
├── deploy-receive.sh     (mirror of infra/scripts/deploy-receive.sh)
└── deploy-ssh-wrapper.sh (created by bootstrap-vps.sh)
```

## How a deploy works

1. GitHub Action runs on push to `preview` or `main`
2. Action sets up SSH using the deploy key from secrets
3. For each changed site under `sites/`:
   - `rsync -az --delete sites/<domain>/ deploy@VPS:/var/www/sites/<domain>/<env>/releases/<timestamp>/`
   - `ssh deploy@VPS '/usr/local/bin/deploy-receive.sh <domain> <env> <timestamp>'`
4. `deploy-receive.sh` validates input against an allowlist, atomically swaps the `current` symlink, prunes releases beyond the newest 5

The deploy user's SSH key is restricted via `command="/usr/local/bin/deploy-ssh-wrapper.sh"` in `~/.ssh/authorized_keys`. The wrapper only allows `rsync --server` (which is what rsync invokes on the receiver side) and the `deploy-receive.sh` command. Anything else is rejected.

## Rollback

Two options, in order of preference:

1. **Via git (preferred — replicable, audit trail):** `git revert HEAD` on `main`, push. The deploy workflow runs again with the previous content.
2. **Via VPS (emergency only):** SSH as `ubuntu`, then:
   ```bash
   cd /var/www/sites/<domain>/prod
   ls releases/                                # list available releases
   sudo -u deploy ln -sfn /var/www/sites/<domain>/prod/releases/<older-timestamp> /var/www/sites/<domain>/prod/.current.tmp
   sudo -u deploy mv -Tf /var/www/sites/<domain>/prod/.current.tmp /var/www/sites/<domain>/prod/current
   ```

## Adding a third site

1. Create `sites/<new-domain>/index.html`
2. Create `infra/nginx/<new-domain>.conf` (copy one of the existing ones, substitute the domain)
3. Add the domain to the `DOMAINS` array in `infra/scripts/bootstrap-vps.sh`
4. Add the domain to the allowlist in `infra/scripts/deploy-receive.sh`
5. Add a unit test for the new domain in `infra/scripts/test-deploy-receive.sh`
6. Add the domain to `ALLOWED_SITES` in both `.github/workflows/deploy-preview.yml` and `.github/workflows/deploy-prod.yml`
7. Add the domain to the allowlist in `CLAUDE.md` (Repo map and external-domains note)
8. Add DNS A records (apex, www, preview)
9. Re-run `sudo ./infra/scripts/bootstrap-vps.sh you@example.com` on the VPS — it picks up the new domain and issues certs

## Backups

The repo is the backup of site content. The bootstrap script is the backup of VPS state — burning down the VPS and rebuilding from scratch is one script run. Recommended: enable VPS provider snapshots in the hosting panel as a belt-and-suspenders.

## Monitoring

Not built into this setup. If you want uptime monitoring, point an external service (UptimeRobot, BetterUptime, etc.) at `https://olzhas-coach.kz/` and `https://parusa.kz/`. Free tier on most providers is enough for two sites.
