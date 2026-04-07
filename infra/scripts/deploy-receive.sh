#!/usr/bin/env bash
# deploy-receive.sh — runs on the VPS as the restricted SSH command for the
# `deploy` user. Validates input strictly, atomically swaps the `current`
# symlink for a release, and prunes old releases.
#
# Usage: deploy-receive.sh <domain> <env> <timestamp>
#   <domain>    olzhas-coach.kz | parusa.kz
#   <env>       prod | preview
#   <timestamp> YYYY-MM-DD_HHMMSS
#
# Exit codes:
#   0  success
#   2  validation failure (bad domain, env, or timestamp format)
#   3  release directory does not exist on disk

set -euo pipefail

DOMAIN="${1:-}"
ENV="${2:-}"
TIMESTAMP="${3:-}"

# DEPLOY_BASE_DIR is overridable for tests; defaults to /var/www/sites in production.
BASE_DIR="${DEPLOY_BASE_DIR:-/var/www/sites}"

# --- Validate domain against hardcoded allowlist ---
case "$DOMAIN" in
    olzhas-coach.kz|parusa.kz) ;;
    *)
        echo "deploy-receive: invalid domain '$DOMAIN'" >&2
        exit 2
        ;;
esac

# --- Validate env against hardcoded allowlist ---
case "$ENV" in
    prod|preview) ;;
    *)
        echo "deploy-receive: invalid env '$ENV'" >&2
        exit 2
        ;;
esac

# --- Validate timestamp format strictly: YYYY-MM-DD_HHMMSS ---
if [[ ! "$TIMESTAMP" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{6}$ ]]; then
    echo "deploy-receive: invalid timestamp '$TIMESTAMP'" >&2
    exit 2
fi

BASE="$BASE_DIR/$DOMAIN/$ENV"
RELEASE="$BASE/releases/$TIMESTAMP"

if [[ ! -d "$RELEASE" ]]; then
    echo "deploy-receive: release directory does not exist: $RELEASE" >&2
    exit 3
fi

# --- Atomic symlink swap ---
# Create a temp symlink in the same directory with a PID-suffixed name (so
# concurrent deploys cannot collide), then `mv -T` over the live one.
# `mv -T` uses rename(2) which is atomic on the same filesystem.
TMP_LINK="$BASE/.current.tmp.$$"
ln -sfn "$RELEASE" "$TMP_LINK"
mv -Tf "$TMP_LINK" "$BASE/current"

# --- Prune old releases (keep newest 5 by name, which is sortable timestamp) ---
RELEASES_DIR="$BASE/releases"
mapfile -t RELEASES < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r)
KEEP=5
for ((idx=KEEP; idx < ${#RELEASES[@]}; idx++)); do
    rm -rf -- "$RELEASES_DIR/${RELEASES[idx]}"
done

echo "deploy-receive: deployed $DOMAIN/$ENV/$TIMESTAMP"
