# Static Sites VPS Hosting & Vibe-Coding Workflow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure this repo to host two static sites on a fresh Ubuntu VPS with HTTPS, preview environments, and a CI/CD pipeline driven by natural-language phrases that a non-technical user issues to Claude.

**Architecture:** Monorepo with `sites/<domain>/` per-site folders. nginx + certbot on the VPS, atomic symlink deploys with last-5 retention. Two-branch git flow: `preview` branch → preview env, `main` branch → prod. GitHub Actions rsyncs over SSH to a restricted `deploy` user. A bilingual `CLAUDE.md` encodes the natural-language → git mapping and hard safety rules.

**Tech Stack:** nginx, Let's Encrypt/certbot, rsync, GitHub Actions, bash, bats-style bash tests, shellcheck, yamllint.

**Reference spec:** `docs/superpowers/specs/2026-04-07-static-sites-vps-design.md`

---

## File structure

Files created or modified by this plan:

| Path | Responsibility |
|---|---|
| `sites/olzhas-coach.kz/index.html` | Olzhas coaching site (moved from repo root) |
| `sites/olzhas-coach.kz/robots.txt` | Production robots.txt — allow all |
| `sites/parusa.kz/index.html` | Yacht club site (moved + renamed from `kapchagay-yacht-club.html`) |
| `sites/parusa.kz/robots.txt` | Production robots.txt — allow all |
| `.gitignore` | Block secrets, OS junk |
| `infra/nginx/olzhas-coach.kz.conf` | Server blocks for apex/www/preview, all 3 hostnames |
| `infra/nginx/parusa.kz.conf` | Same, for parusa.kz |
| `infra/scripts/deploy-receive.sh` | Runs on VPS as restricted SSH command. Validates input, atomically swaps the `current` symlink, prunes old releases. |
| `infra/scripts/test-deploy-receive.sh` | Bash test runner. Verifies allowlisting, regex, atomic swap, pruning. |
| `infra/scripts/bootstrap-vps.sh` | One-time VPS provisioning. Idempotent. Run by the operator over SSH. |
| `infra/README.md` | Operator notes (DNS, secrets, bootstrap procedure). NOT for the friend. |
| `.github/workflows/deploy-preview.yml` | Triggered by push to `preview` — rsyncs changed sites to preview env |
| `.github/workflows/deploy-prod.yml` | Triggered by push to `main` — same, with safety guard |
| `CLAUDE.md` | Bilingual operating contract for Claude when the friend uses the repo |
| `README.md` | Short, friend-readable overview |

---

## Phase A — Local files (tasks 1–13)

### Task 1: Create the new directory layout and move site files

**Files:**
- Create: `sites/olzhas-coach.kz/`
- Create: `sites/parusa.kz/`
- Move: `index.html` → `sites/olzhas-coach.kz/index.html`
- Move: `kapchagay-yacht-club.html` → `sites/parusa.kz/index.html`

- [ ] **Step 1: Create the directories**

```bash
mkdir -p sites/olzhas-coach.kz sites/parusa.kz
```

- [ ] **Step 2: Move the HTML files using `git mv` to preserve history**

```bash
git mv index.html sites/olzhas-coach.kz/index.html
git mv kapchagay-yacht-club.html sites/parusa.kz/index.html
```

- [ ] **Step 3: Verify**

Run: `ls sites/olzhas-coach.kz sites/parusa.kz`
Expected: each directory contains `index.html`. Original files at the repo root no longer exist.

Run: `git status`
Expected: shows two `renamed:` entries.

- [ ] **Step 4: Do NOT commit yet — wait until the user explicitly asks. Per global rules in `~/.claude/CLAUDE.md`: never commit without explicit request.**

---

### Task 2: Add production `robots.txt` for each site

**Files:**
- Create: `sites/olzhas-coach.kz/robots.txt`
- Create: `sites/parusa.kz/robots.txt`

- [ ] **Step 1: Create `sites/olzhas-coach.kz/robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 2: Create `sites/parusa.kz/robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 3: Verify**

Run: `cat sites/olzhas-coach.kz/robots.txt sites/parusa.kz/robots.txt`
Expected: both files print the two-line content above. Note that the preview environment will *override* this via an nginx `location = /robots.txt` block — see Task 4. The friend never has to maintain a second robots.txt.

---

### Task 3: Add `.gitignore`

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```gitignore
# Secrets — never commit
.env
.env.*
*.pem
*.key
id_rsa*
*.p12
*.pfx
secrets/

# OS junk
.DS_Store
Thumbs.db
desktop.ini

# Editor/IDE
.idea/
.vscode/
*.swp
*.swo
*~

# Logs and temp
*.log
tmp/
.cache/
```

- [ ] **Step 2: Verify**

Run: `cat .gitignore`
Expected: file matches above.

---

### Task 4: Write nginx server-block config for `olzhas-coach.kz`

**Files:**
- Create: `infra/nginx/olzhas-coach.kz.conf`

This file contains all server blocks for the domain: HTTP→HTTPS redirects, www → apex redirect, the prod HTTPS server, and the preview HTTPS server with `noindex`. Certbot will rewrite the HTTP blocks to add redirect and edit the HTTPS blocks during cert issuance — the file we ship is the *pre-certbot* version, and `bootstrap-vps.sh` runs `certbot --nginx` which transforms it.

- [ ] **Step 1: Create the file**

```nginx
# infra/nginx/olzhas-coach.kz.conf
# Pre-certbot HTTP-only configuration. `certbot --nginx` will add HTTPS
# server blocks and HTTP→HTTPS redirects on first run.

# --- Production: apex ---
server {
    listen 80;
    listen [::]:80;
    server_name olzhas-coach.kz;

    root /var/www/sites/olzhas-coach.kz/prod/current;
    index index.html;

    access_log /var/log/nginx/olzhas-coach.kz.access.log;
    error_log  /var/log/nginx/olzhas-coach.kz.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    # Long cache for assets, short for HTML
    location ~* \.(html)$ {
        add_header Cache-Control "no-cache, must-revalidate" always;
    }
    location ~* \.(css|js|jpg|jpeg|png|gif|svg|webp|woff2?|ttf|ico)$ {
        add_header Cache-Control "public, max-age=604800" always;
    }
}

# --- Production: www → apex 301 ---
server {
    listen 80;
    listen [::]:80;
    server_name www.olzhas-coach.kz;
    return 301 http://olzhas-coach.kz$request_uri;
}

# --- Preview ---
server {
    listen 80;
    listen [::]:80;
    server_name preview.olzhas-coach.kz;

    root /var/www/sites/olzhas-coach.kz/preview/current;
    index index.html;

    access_log /var/log/nginx/olzhas-coach.kz.preview.access.log;
    error_log  /var/log/nginx/olzhas-coach.kz.preview.error.log;

    # Block search engines at the response level
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;

    # Override any robots.txt in the release dir with a hard noindex
    location = /robots.txt {
        add_header Content-Type text/plain;
        add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
        return 200 "User-agent: *\nDisallow: /\n";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

- [ ] **Step 2: Verify the file is syntactically valid (best-effort, without nginx installed locally)**

If `nginx` is available locally:

Run: `nginx -t -c $(pwd)/infra/nginx/olzhas-coach.kz.conf 2>&1 || true`
Expected: nginx complains about missing `events {}` / `http {}` outer blocks (this file is a fragment for `sites-available/`, that is normal). The check passes if there are no syntax errors *inside* the server blocks.

If nginx is not available locally, defer full validation to bootstrap time on the VPS, where `nginx -t` runs against the merged config. Move on.

---

### Task 5: Write nginx server-block config for `parusa.kz`

**Files:**
- Create: `infra/nginx/parusa.kz.conf`

- [ ] **Step 1: Create the file (identical structure to olzhas-coach.kz, with domain substituted)**

```nginx
# infra/nginx/parusa.kz.conf
# Pre-certbot HTTP-only configuration. `certbot --nginx` will add HTTPS
# server blocks and HTTP→HTTPS redirects on first run.

# --- Production: apex ---
server {
    listen 80;
    listen [::]:80;
    server_name parusa.kz;

    root /var/www/sites/parusa.kz/prod/current;
    index index.html;

    access_log /var/log/nginx/parusa.kz.access.log;
    error_log  /var/log/nginx/parusa.kz.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(html)$ {
        add_header Cache-Control "no-cache, must-revalidate" always;
    }
    location ~* \.(css|js|jpg|jpeg|png|gif|svg|webp|woff2?|ttf|ico)$ {
        add_header Cache-Control "public, max-age=604800" always;
    }
}

# --- Production: www → apex 301 ---
server {
    listen 80;
    listen [::]:80;
    server_name www.parusa.kz;
    return 301 http://parusa.kz$request_uri;
}

# --- Preview ---
server {
    listen 80;
    listen [::]:80;
    server_name preview.parusa.kz;

    root /var/www/sites/parusa.kz/preview/current;
    index index.html;

    access_log /var/log/nginx/parusa.kz.preview.access.log;
    error_log  /var/log/nginx/parusa.kz.preview.error.log;

    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;

    location = /robots.txt {
        add_header Content-Type text/plain;
        add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
        return 200 "User-agent: *\nDisallow: /\n";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

- [ ] **Step 2: Verify file exists and contains the three `server { ... }` blocks**

Run: `grep -c '^server {' infra/nginx/parusa.kz.conf`
Expected: `3`

---

### Task 6: Write the failing test for `deploy-receive.sh` — invalid domain

**Files:**
- Create: `infra/scripts/test-deploy-receive.sh`

This file contains all tests for `deploy-receive.sh`. It uses no test framework — just bash functions and exit codes. Each test call sets up a fresh sandbox under a temp dir, runs the script with `DEPLOY_BASE_DIR` pointing at the sandbox, and asserts on exit code and side effects.

- [ ] **Step 1: Create the test file with the invalid-domain test**

```bash
#!/usr/bin/env bash
# Tests for deploy-receive.sh.
# Run: ./infra/scripts/test-deploy-receive.sh
# Exits non-zero if any test fails.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$SCRIPT_DIR/deploy-receive.sh"

PASS=0
FAIL=0

assert_eq() {
    # $1=actual $2=expected $3=message
    if [[ "$1" == "$2" ]]; then
        PASS=$((PASS+1))
        echo "  PASS: $3"
    else
        FAIL=$((FAIL+1))
        echo "  FAIL: $3 (expected '$2', got '$1')"
    fi
}

setup_sandbox() {
    SANDBOX="$(mktemp -d)"
    mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases"
    mkdir -p "$SANDBOX/olzhas-coach.kz/preview/releases"
    mkdir -p "$SANDBOX/parusa.kz/prod/releases"
    mkdir -p "$SANDBOX/parusa.kz/preview/releases"
    export DEPLOY_BASE_DIR="$SANDBOX"
}

teardown_sandbox() {
    rm -rf "$SANDBOX"
    unset DEPLOY_BASE_DIR
}

# ---------- TEST: invalid domain rejected ----------
echo "TEST: invalid domain rejected"
setup_sandbox
"$SUT" evil.com prod 2026-04-07_120000 >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for unknown domain"
teardown_sandbox

echo ""
echo "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]] || exit 1
```

- [ ] **Step 2: Make the test file executable**

Run: `chmod +x infra/scripts/test-deploy-receive.sh`

- [ ] **Step 3: Run the test — it should fail because `deploy-receive.sh` does not exist yet**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: error like `line ...: .../deploy-receive.sh: No such file or directory`, exit code 1, `0 passed, 1 failed` line not reached. This is the failing test.

---

### Task 7: Implement `deploy-receive.sh` — minimum to pass the invalid-domain test

**Files:**
- Create: `infra/scripts/deploy-receive.sh`

- [ ] **Step 1: Create the script**

```bash
#!/usr/bin/env bash
# deploy-receive.sh — runs on the VPS as the restricted SSH command for the
# `deploy` user. Validates input strictly, atomically swaps the `current`
# symlink for a release, and prunes old releases.
#
# Usage: deploy-receive.sh <domain> <env> <timestamp>
#   <domain>    olzhas-coach.kz | parusa.kz
#   <env>       prod | preview
#   <timestamp> YYYY-MM-DD_HHMMSS

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
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x infra/scripts/deploy-receive.sh`

- [ ] **Step 3: Run the test**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `1 passed, 0 failed`. The invalid-domain test passes because the script exits with code 2.

---

### Task 8: Add the invalid-env test, then extend the script to pass it

**Files:**
- Modify: `infra/scripts/test-deploy-receive.sh`
- Modify: `infra/scripts/deploy-receive.sh`

- [ ] **Step 1: Add the invalid-env test to `test-deploy-receive.sh`** — insert these lines just before the `echo ""` / Results block at the bottom:

```bash
# ---------- TEST: invalid env rejected ----------
echo "TEST: invalid env rejected"
setup_sandbox
"$SUT" olzhas-coach.kz staging 2026-04-07_120000 >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for unknown env"
teardown_sandbox
```

- [ ] **Step 2: Run the test — invalid-env case should fail**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: 1 passed, 1 failed. The new test fails because the script exits successfully (or with a non-2 code) for an unknown env.

- [ ] **Step 3: Add env validation to `deploy-receive.sh`** — append after the domain `case` block:

```bash
# --- Validate env against hardcoded allowlist ---
case "$ENV" in
    prod|preview) ;;
    *)
        echo "deploy-receive: invalid env '$ENV'" >&2
        exit 2
        ;;
esac
```

- [ ] **Step 4: Run the test**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `2 passed, 0 failed`.

---

### Task 9: Add invalid-timestamp tests (path traversal + bad format), then extend the script

**Files:**
- Modify: `infra/scripts/test-deploy-receive.sh`
- Modify: `infra/scripts/deploy-receive.sh`

- [ ] **Step 1: Add three timestamp tests to `test-deploy-receive.sh`** — insert before the Results block:

```bash
# ---------- TEST: timestamp with path traversal rejected ----------
echo "TEST: path traversal in timestamp rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod "../../etc" >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for path traversal"
teardown_sandbox

# ---------- TEST: timestamp with wrong format rejected ----------
echo "TEST: malformed timestamp rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod "2026-4-7_12000" >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for malformed timestamp"
teardown_sandbox

# ---------- TEST: timestamp with shell metacharacters rejected ----------
echo "TEST: timestamp with metacharacters rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod "2026-04-07_120000;rm" >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for shell metacharacters"
teardown_sandbox
```

- [ ] **Step 2: Run — three new tests should fail**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `2 passed, 3 failed`.

- [ ] **Step 3: Add timestamp validation to `deploy-receive.sh`** — append after the env `case` block:

```bash
# --- Validate timestamp format strictly: YYYY-MM-DD_HHMMSS ---
if [[ ! "$TIMESTAMP" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{6}$ ]]; then
    echo "deploy-receive: invalid timestamp '$TIMESTAMP'" >&2
    exit 2
fi
```

- [ ] **Step 4: Run the tests**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `5 passed, 0 failed`.

---

### Task 10: Add the missing-release-dir test, then extend the script

**Files:**
- Modify: `infra/scripts/test-deploy-receive.sh`
- Modify: `infra/scripts/deploy-receive.sh`

- [ ] **Step 1: Add the missing-release-dir test to `test-deploy-receive.sh`** — insert before the Results block:

```bash
# ---------- TEST: missing release directory rejected ----------
echo "TEST: missing release directory rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod 2026-04-07_120000 >/dev/null 2>&1
assert_eq "$?" "3" "exit code is 3 when release dir does not exist"
teardown_sandbox
```

- [ ] **Step 2: Run — the new test should fail**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `5 passed, 1 failed`.

- [ ] **Step 3: Add the existence check to `deploy-receive.sh`** — append after the timestamp validation:

```bash
BASE="$BASE_DIR/$DOMAIN/$ENV"
RELEASE="$BASE/releases/$TIMESTAMP"

if [[ ! -d "$RELEASE" ]]; then
    echo "deploy-receive: release directory does not exist: $RELEASE" >&2
    exit 3
fi
```

- [ ] **Step 4: Run the test**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `6 passed, 0 failed`.

---

### Task 11: Add the atomic-swap test, then implement the swap

**Files:**
- Modify: `infra/scripts/test-deploy-receive.sh`
- Modify: `infra/scripts/deploy-receive.sh`

- [ ] **Step 1: Add the atomic-swap test to `test-deploy-receive.sh`** — insert before the Results block:

```bash
# ---------- TEST: valid input swaps current symlink ----------
echo "TEST: valid input swaps current symlink"
setup_sandbox
mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_120000"
echo "release-A" > "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_120000/index.html"
"$SUT" olzhas-coach.kz prod 2026-04-07_120000 >/dev/null 2>&1
ACTUAL_EXIT="$?"
assert_eq "$ACTUAL_EXIT" "0" "exit code is 0 for valid deploy"
ACTUAL_CONTENT="$(cat "$SANDBOX/olzhas-coach.kz/prod/current/index.html" 2>/dev/null || echo MISSING)"
assert_eq "$ACTUAL_CONTENT" "release-A" "current/index.html serves the new release"

# Replace with a second release and re-run
mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_130000"
echo "release-B" > "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_130000/index.html"
"$SUT" olzhas-coach.kz prod 2026-04-07_130000 >/dev/null 2>&1
ACTUAL_CONTENT="$(cat "$SANDBOX/olzhas-coach.kz/prod/current/index.html" 2>/dev/null || echo MISSING)"
assert_eq "$ACTUAL_CONTENT" "release-B" "current/index.html now serves the second release"
teardown_sandbox
```

- [ ] **Step 2: Run — the new test should fail (script doesn't swap yet)**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `6 passed, 3 failed` (the assertion on `current/index.html` content fails twice, plus exit code on second deploy may be off).

- [ ] **Step 3: Add the symlink swap to `deploy-receive.sh`** — append:

```bash
# --- Atomic symlink swap ---
# Create a temp symlink in the same directory, then `mv -T` over the live one.
# `mv -T` (treat target as a normal file) uses rename(2) which is atomic on
# the same filesystem.
ln -sfn "$RELEASE" "$BASE/.current.tmp"
mv -Tf "$BASE/.current.tmp" "$BASE/current"
```

- [ ] **Step 4: Run the test**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `9 passed, 0 failed`.

---

### Task 12: Add the pruning test, then implement the prune

**Files:**
- Modify: `infra/scripts/test-deploy-receive.sh`
- Modify: `infra/scripts/deploy-receive.sh`

- [ ] **Step 1: Add the pruning test to `test-deploy-receive.sh`** — insert before the Results block:

```bash
# ---------- TEST: pruning keeps newest 5 releases ----------
echo "TEST: pruning keeps newest 5 releases"
setup_sandbox
# Create 7 releases with sortable timestamps
for i in 01 02 03 04 05 06 07; do
    TS="2026-04-${i}_120000"
    mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases/$TS"
    echo "release-$i" > "$SANDBOX/olzhas-coach.kz/prod/releases/$TS/index.html"
done
# Deploy the newest one — that should trigger pruning of the 2 oldest
"$SUT" olzhas-coach.kz prod 2026-04-07_120000 >/dev/null 2>&1
COUNT="$(find "$SANDBOX/olzhas-coach.kz/prod/releases" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
assert_eq "$COUNT" "5" "exactly 5 release directories remain"
# The two oldest (01, 02) should be gone
[[ ! -d "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-01_120000" ]]
assert_eq "$?" "0" "release 01 was pruned"
[[ ! -d "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-02_120000" ]]
assert_eq "$?" "0" "release 02 was pruned"
# The newest (07, the one we just deployed) should still exist
[[ -d "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_120000" ]]
assert_eq "$?" "0" "newest release 07 still exists"
teardown_sandbox
```

- [ ] **Step 2: Run — the new test should fail**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `9 passed, 4 failed` — count is 7, oldest releases still present.

- [ ] **Step 3: Add the prune step to `deploy-receive.sh`** — append:

```bash
# --- Prune old releases (keep newest 5 by name, which is sortable timestamp) ---
RELEASES_DIR="$BASE/releases"
# `ls -1` would parse names; use a glob and sort instead for safety.
mapfile -t RELEASES < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r)
KEEP=5
for ((idx=KEEP; idx < ${#RELEASES[@]}; idx++)); do
    rm -rf -- "$RELEASES_DIR/${RELEASES[idx]}"
done

echo "deploy-receive: deployed $DOMAIN/$ENV/$TIMESTAMP"
```

- [ ] **Step 4: Run the test**

Run: `./infra/scripts/test-deploy-receive.sh`
Expected: `13 passed, 0 failed`.

- [ ] **Step 5: Run shellcheck on the script**

Run: `command -v shellcheck >/dev/null && shellcheck infra/scripts/deploy-receive.sh || echo "shellcheck not installed, skipping"`
Expected: no warnings, OR the "not installed" message. Fix any warnings inline before proceeding.

- [ ] **Step 6: Print the final script for review**

Run: `cat infra/scripts/deploy-receive.sh`
Expected: contains the strict-mode header, `BASE_DIR` override support, all four validation gates, atomic swap, prune loop, and final echo. No TODOs.

---

### Task 13: Write `bootstrap-vps.sh`

**Files:**
- Create: `infra/scripts/bootstrap-vps.sh`

This script is run by the operator (you) over SSH on a fresh Ubuntu VPS. It is idempotent — re-running it on a half-configured server completes the missing pieces. It cannot be unit-tested locally; verification is shellcheck + integration test on the real VPS during Phase B.

- [ ] **Step 1: Create the script**

```bash
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
if [[ -z "$ADMIN_EMAIL" ]]; then
    echo "Usage: sudo $0 <admin-email>" >&2
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
# The public key is already at /home/deploy/.ssh/id_ed25519.pub.
# We restrict it to running deploy-receive.sh only. The actual command the
# script receives comes from $SSH_ORIGINAL_COMMAND, which is set by sshd when
# the client uses `ssh deploy@host '<command>'`.
# rsync uses its own command pattern; we accept it via a wrapper.
AUTH_KEYS=/home/deploy/.ssh/authorized_keys
PUB_KEY="$(cat /home/deploy/.ssh/id_ed25519.pub)"
RESTRICT='command="/usr/local/bin/deploy-ssh-wrapper.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,restrict'

# Wrapper that allows rsync receiver and deploy-receive.sh, nothing else.
cat > /usr/local/bin/deploy-ssh-wrapper.sh <<'WRAPPER'
#!/usr/bin/env bash
set -euo pipefail
case "${SSH_ORIGINAL_COMMAND:-}" in
    "rsync --server"*) exec $SSH_ORIGINAL_COMMAND ;;
    "/usr/local/bin/deploy-receive.sh "*)
        # Re-parse args to validate count and pass through
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

# Write authorized_keys atomically
echo "$RESTRICT $PUB_KEY" > "${AUTH_KEYS}.tmp"
chown deploy:deploy "${AUTH_KEYS}.tmp"
chmod 600 "${AUTH_KEYS}.tmp"
mv -f "${AUTH_KEYS}.tmp" "$AUTH_KEYS"

echo "==> 12. Issuing TLS certificates with certbot"
# This rewrites the nginx config in place to add HTTPS server blocks and
# HTTP→HTTPS redirects. Idempotent: certbot detects existing certs and skips.
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

systemctl reload nginx

echo ""
echo "================================================================"
echo "Bootstrap complete."
echo ""
echo "Add these to GitHub repo secrets:"
echo "  VPS_HOST           = $(curl -fsS https://api.ipify.org || echo 194.32.142.140)"
echo "  VPS_USER           = deploy"
echo "  VPS_SSH_KEY        = (contents of $DEPLOY_KEY — copy carefully)"
echo "  VPS_SSH_KNOWN_HOSTS = $(ssh-keyscan -t ed25519 localhost 2>/dev/null | sed "s/localhost/$(hostname -I | awk '{print $1}')/")"
echo ""
echo "Verify with:"
for d in "${DOMAINS[@]}"; do
    echo "  curl -I https://$d"
    echo "  curl -I https://preview.$d"
done
echo "================================================================"
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x infra/scripts/bootstrap-vps.sh`

- [ ] **Step 3: Run shellcheck**

Run: `command -v shellcheck >/dev/null && shellcheck infra/scripts/bootstrap-vps.sh || echo "shellcheck not installed, skipping"`
Expected: no errors. Warnings about `SC2086` near `exec $SSH_ORIGINAL_COMMAND` are deliberate (we want word splitting there) and disabled inline. If shellcheck is not installed locally, defer; the script will be re-checked when run on the VPS.

---

## Phase B — CI/CD workflows (tasks 14–15)

### Task 14: Write `deploy-preview.yml`

**Files:**
- Create: `.github/workflows/deploy-preview.yml`

- [ ] **Step 1: Create the workflow**

```yaml
# .github/workflows/deploy-preview.yml
name: Deploy preview

on:
  push:
    branches:
      - preview

concurrency:
  group: preview-deploy
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Detect changed sites
        id: changed
        run: |
          set -euo pipefail
          # On the very first commit, HEAD~1 may not exist — fall back to all sites.
          if git rev-parse HEAD~1 >/dev/null 2>&1; then
              CHANGED=$(git diff --name-only HEAD~1 HEAD -- 'sites/*' \
                  | awk -F/ '{print $2}' | sort -u | grep -v '^$' || true)
          else
              CHANGED=""
          fi
          if [[ -z "$CHANGED" ]]; then
              CHANGED=$(find sites -mindepth 1 -maxdepth 1 -type d -printf '%f\n')
          fi
          echo "Changed sites:"
          echo "$CHANGED"
          # Multiline output via heredoc
          {
              echo "sites<<EOF"
              echo "$CHANGED"
              echo "EOF"
          } >> "$GITHUB_OUTPUT"

      - name: Set up SSH
        run: |
          set -euo pipefail
          mkdir -p ~/.ssh
          chmod 700 ~/.ssh
          echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          echo "${{ secrets.VPS_SSH_KNOWN_HOSTS }}" > ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      - name: Deploy each changed site
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          set -euo pipefail
          TIMESTAMP=$(date -u +%Y-%m-%d_%H%M%S)
          while IFS= read -r site; do
              [[ -z "$site" ]] && continue
              echo "==> Deploying $site to preview ($TIMESTAMP)"
              rsync -az --delete \
                  -e "ssh -i ~/.ssh/id_ed25519 -o UserKnownHostsFile=~/.ssh/known_hosts" \
                  "sites/$site/" \
                  "$VPS_USER@$VPS_HOST:/var/www/sites/$site/preview/releases/$TIMESTAMP/"
              ssh -i ~/.ssh/id_ed25519 -o UserKnownHostsFile=~/.ssh/known_hosts \
                  "$VPS_USER@$VPS_HOST" \
                  "/usr/local/bin/deploy-receive.sh $site preview $TIMESTAMP"
              echo "    ✓ https://preview.$site"
          done <<< "${{ steps.changed.outputs.sites }}"

      - name: Summary
        if: always()
        run: |
          {
              echo "## Preview deploy"
              echo ""
              while IFS= read -r site; do
                  [[ -z "$site" ]] && continue
                  echo "- https://preview.$site"
              done <<< "${{ steps.changed.outputs.sites }}"
          } >> "$GITHUB_STEP_SUMMARY"
```

- [ ] **Step 2: Validate YAML syntax**

Run: `command -v yamllint >/dev/null && yamllint -d "{extends: relaxed, rules: {line-length: disable}}" .github/workflows/deploy-preview.yml || python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-preview.yml'))"`
Expected: no errors.

---

### Task 15: Write `deploy-prod.yml`

**Files:**
- Create: `.github/workflows/deploy-prod.yml`

- [ ] **Step 1: Create the workflow**

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy production

on:
  push:
    branches:
      - main

concurrency:
  group: prod-deploy
  cancel-in-progress: false  # Never cancel a prod deploy mid-flight

jobs:
  guard:
    runs-on: ubuntu-latest
    outputs:
      ok: ${{ steps.check.outputs.ok }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need full history to verify ancestry

      - name: Verify commit was promoted via preview
        id: check
        run: |
          set -euo pipefail
          # The HEAD of main must be reachable from origin/preview, otherwise
          # someone committed straight to main without going through the
          # preview workflow.
          git fetch origin preview --depth=100
          if git merge-base --is-ancestor HEAD origin/preview; then
              echo "ok=true" >> "$GITHUB_OUTPUT"
              echo "✓ commit is on preview branch — promotion is valid"
          else
              echo "ok=false" >> "$GITHUB_OUTPUT"
              echo "::error::This commit was not promoted via the preview branch."
              echo "::error::Run the change through preview first, then merge preview into main."
              exit 1
          fi

  deploy:
    needs: guard
    if: needs.guard.outputs.ok == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Detect changed sites
        id: changed
        run: |
          set -euo pipefail
          if git rev-parse HEAD~1 >/dev/null 2>&1; then
              CHANGED=$(git diff --name-only HEAD~1 HEAD -- 'sites/*' \
                  | awk -F/ '{print $2}' | sort -u | grep -v '^$' || true)
          else
              CHANGED=""
          fi
          if [[ -z "$CHANGED" ]]; then
              CHANGED=$(find sites -mindepth 1 -maxdepth 1 -type d -printf '%f\n')
          fi
          echo "Changed sites:"
          echo "$CHANGED"
          {
              echo "sites<<EOF"
              echo "$CHANGED"
              echo "EOF"
          } >> "$GITHUB_OUTPUT"

      - name: Set up SSH
        run: |
          set -euo pipefail
          mkdir -p ~/.ssh
          chmod 700 ~/.ssh
          echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          echo "${{ secrets.VPS_SSH_KNOWN_HOSTS }}" > ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      - name: Deploy each changed site
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          set -euo pipefail
          TIMESTAMP=$(date -u +%Y-%m-%d_%H%M%S)
          while IFS= read -r site; do
              [[ -z "$site" ]] && continue
              echo "==> Deploying $site to PRODUCTION ($TIMESTAMP)"
              rsync -az --delete \
                  -e "ssh -i ~/.ssh/id_ed25519 -o UserKnownHostsFile=~/.ssh/known_hosts" \
                  "sites/$site/" \
                  "$VPS_USER@$VPS_HOST:/var/www/sites/$site/prod/releases/$TIMESTAMP/"
              ssh -i ~/.ssh/id_ed25519 -o UserKnownHostsFile=~/.ssh/known_hosts \
                  "$VPS_USER@$VPS_HOST" \
                  "/usr/local/bin/deploy-receive.sh $site prod $TIMESTAMP"
              echo "    ✓ https://$site"
          done <<< "${{ steps.changed.outputs.sites }}"

      - name: Summary
        if: always()
        run: |
          {
              echo "## Production deploy"
              echo ""
              while IFS= read -r site; do
                  [[ -z "$site" ]] && continue
                  echo "- https://$site"
              done <<< "${{ steps.changed.outputs.sites }}"
          } >> "$GITHUB_STEP_SUMMARY"
```

- [ ] **Step 2: Validate YAML**

Run: `command -v yamllint >/dev/null && yamllint -d "{extends: relaxed, rules: {line-length: disable}}" .github/workflows/deploy-prod.yml || python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-prod.yml'))"`
Expected: no errors.

---

## Phase C — Documentation (tasks 16–18)

### Task 16: Write `CLAUDE.md` (bilingual)

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create the file**

```markdown
# CLAUDE.md — Operating contract for this repo

> **For Claude:** This file is your single source of truth for how to behave in this repo. Read it on every session. The user is non-technical and relies on you to translate plain language into safe git operations.

---

## Краткое резюме (для владельца репозитория)

Этот репозиторий содержит два сайта: **olzhas-coach.kz** и **parusa.kz**. Они хостятся на нашем сервере. Ты можешь редактировать сайты, разговаривая с Клодом обычным языком.

**Как работают изменения:**
1. Ты говоришь, что хочешь поменять (например: «измени телефон в шапке на 8 777 ...»).
2. Клод правит файл и говорит фразу типа *«покажи»* или *«загрузи на превью»* — Клод выкатит изменения на тестовый адрес `preview.olzhas-coach.kz` или `preview.parusa.kz`. Только ты увидишь там изменения, поисковики туда не заглядывают.
3. Когда ты доволен и говоришь *«публикуй»* / *«в продакшн»* / *«выкатывай»* — Клод выкатит изменения на боевой сайт.
4. Если что-то сломалось, скажи *«откати»* — Клод вернёт предыдущую версию.

**Что Клод НЕ будет делать (для твоей же безопасности):**
- Менять настройки сервера или CI/CD (папки `infra/` и `.github/`).
- Добавлять чужие скрипты/трекеры на сайт без твоего разрешения.
- Удалять или менять этот файл (`CLAUDE.md`).
- Коммитить пароли, ключи или секреты.

Если тебе нужно что-то из этого списка — попроси Романа.

---

## English instructions for Claude (operative)

### Who you are talking to

A non-technical user. He doesn't know git, HTML, CSS, or how servers work. Don't use jargon. Don't show diffs unless he asks. Don't explain things he didn't ask about. Be brief and friendly. If he asks "why," give a one-sentence plain-language answer.

### Repo map

- `sites/<domain>/` — site source files. **This is the only directory you may edit by default.**
  - `sites/olzhas-coach.kz/index.html` — Olzhas Kundakbayev coaching site
  - `sites/parusa.kz/index.html` — Kapchagay Yacht Club site
- `infra/` — VPS configuration, deploy scripts, nginx configs. **Read-only for you.** If asked to edit, refuse politely (see "Hard no list").
- `.github/workflows/` — CI/CD workflows. **Read-only for you.** Same rule.
- `CLAUDE.md` — this file. **Read-only for you.** Never edit it.
- `docs/` — design docs. Not user-facing. You may read them for context but don't edit unless asked.
- `README.md` — short overview. You may edit on request.

### Deploy workflow — natural language to git

Map the user's words to actions using these tables. Match liberally — any phrase that *means* the thing should trigger the action.

#### Phrases that mean **"deploy to preview"**

English: "show me", "show me the changes", "let me see it", "upload", "deploy", "deploy to preview", "update preview", "push it", "let's see how it looks"

Russian: «покажи», «покажи изменения», «загрузи», «загрузи на превью», «выложи», «обнови превью», «давай посмотрим»

**Action:**
1. Make sure you're on the `preview` branch. If it doesn't exist locally, create it from `main`: `git checkout -B preview origin/preview` (or from main if no remote preview).
2. Stage and commit the edits with a plain-English commit message describing what visibly changed (not "fix" or "update" — say what the user will *see*: e.g., "Update phone number on contact section").
3. Push: `git push origin preview`
4. Tell the user: "Pushed to preview. Once it finishes (about a minute), you can see it at:" and list the preview URLs for the sites that changed.
5. Do NOT switch back to main afterwards. The friend stays on `preview` between deploys. `main` is only touched during a prod promotion.

#### Phrases that mean **"deploy to production"**

English: "deploy to prod", "make it live", "publish", "ship it", "send to production", "push to prod", "looks good — go live"

Russian: «выкатывай», «публикуй», «в продакшн», «на боевой», «пускай в прод», «всё ок — выкатывай»

**Action:**
1. Verify `preview` is ahead of `main`: `git fetch origin && git rev-list --count main..preview`. If 0, tell the user "Nothing new to publish — preview matches production already" and stop.
2. Switch to main and fast-forward merge: `git checkout main && git merge --ff-only preview`. If FF fails (history diverged), STOP and tell the user "Something unusual happened — main has changes that aren't on preview. I need to ask Roman to sort this out before publishing."
3. Push: `git push origin main`
4. Switch back to preview: `git checkout preview`
5. Tell the user: "Published. Live in about a minute at:" and list the production URLs.

#### Phrases that mean **"roll back"**

English: "roll back", "undo", "revert", "go back", "the previous version was better", "restore the old one"

Russian: «откати», «откатись», «верни как было», «верни предыдущую версию», «отмени», «верни»

**Action:**
1. Confirm with the user which environment to roll back: prod or preview. Default to prod if unclear.
2. For prod: `git checkout main && git revert --no-edit HEAD && git push origin main && git checkout preview`. This creates a new commit that undoes the previous one — the deploy workflow runs again and serves the previous version.
3. Tell the user: "Reverted. Previous version will be live in about a minute."

### Editing rules

- **Always read a file before editing it.** Never guess at structure based on filename or memory.
- **Keep changes minimal.** If the user says "change the phone number," change only the phone number. Don't reformat the surrounding HTML, don't tidy up CSS, don't refactor.
- **Don't add new external scripts or stylesheets** unless the source domain is on the allowlist (below) and the user explicitly approved it.
- **Never put secrets in HTML.** No API keys, no passwords, no auth tokens. Static sites should have none of these.
- **Never disable the `noindex` on preview**, never delete `robots.txt`.

### Allowlist of external domains currently used

These are the only domains the sites currently load resources from. If the user asks to add a third-party widget, tracker, analytics, chat, or anything from a domain not on this list, ask first and explain in one sentence why ("this domain isn't currently used; adding it means the site loads code from someone else — is that what you want?").

- **Both sites:** `fonts.googleapis.com`, `fonts.gstatic.com` (Google Fonts)
- **Both sites:** `wa.me` (WhatsApp deep links — these are just URLs, not loaded resources, but still on the allowlist)
- **`parusa.kz` only:** `instagram.com` (link in footer, not loaded resource)

### Commit rules

- One logical change per commit.
- Commit message in plain English, present tense, describing the *visible* change. Examples:
  - ✅ "Update WhatsApp number to 8 701 ..."
  - ✅ "Add new pricing block for individual coaching"
  - ❌ "fix"
  - ❌ "update index.html"
  - ❌ "Refactor pricing section CSS"
- Never `--amend`, never force-push, never rebase published branches.
- Never include "claude code", "Claude", or AI-generated markers in commit messages.

### Hard "no" list — refuse politely if asked

If the user asks for any of the following, refuse in one sentence and offer to relay the request to Roman:

1. Editing `infra/`, `.github/workflows/`, or `CLAUDE.md`
2. Adding any secret, token, API key, password, or credential to any file
3. Adding `<script src="...">`, `<link rel="stylesheet" href="...">`, `<iframe src="...">`, or any other external resource from a domain not on the allowlist above
4. Disabling the `X-Robots-Tag` or `noindex` on preview
5. Deleting `sites/<any>/robots.txt`
6. Force-pushing, deleting branches, rebasing published commits, or amending pushed commits
7. Running shell commands on the VPS
8. Committing files outside `sites/` (unless the user explicitly says "yes I know this is unusual" — and even then double-check)
9. Adding tracking pixels, analytics scripts, or any third-party SDK without an explicit conversation about what data is collected

**How to refuse:** "I can't do that automatically — it could break the live site or expose secrets. Want me to ask Roman to do it safely?"

### When something breaks

- **Deploy failed (red ❌ on GitHub):** read the workflow logs, identify the failure (rsync timeout, validation error, certbot, etc.), explain in plain language. Propose `roll back` as the first option if the user is panicking.
- **"The site looks broken":** ask which one (prod or preview), ask what they see, look at the last few commits on `main` (`git log --oneline -10 main`), propose rolling back the most recent change.
- **Never claim "fixed" until the next deploy succeeds.** Wait for confirmation.

### Things to remind the user when relevant

- **Preview ≠ production.** Preview shows drafts. Production is what visitors see.
- **DNS changes take time.** If a domain change just happened, wait 10 minutes before panicking.
- **"Show me what's currently live"** → run `git log --oneline -5 main` and read out the last few commit messages.
- **Browser cache:** if the user says "I changed the text but it still looks old," ask them to do a hard refresh (Cmd+Shift+R / Ctrl+Shift+F5).
```

- [ ] **Step 2: Verify length and structure**

Run: `wc -l CLAUDE.md`
Expected: between 150 and 280 lines.

Run: `grep -c '^##' CLAUDE.md`
Expected: at least 5 H2 sections.

---

### Task 17: Write `README.md`

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create the file**

```markdown
# Olzhas sites

Two static websites maintained via Claude:

- **olzhas-coach.kz** — Olzhas Kundakbayev (ICF business coach)
- **parusa.kz** — Kapchagay Yacht Club

Both are hosted on a single Ubuntu VPS. Deploys happen automatically when changes are pushed to GitHub.

## How to make changes

Open this repo in Claude (claude.ai with the GitHub integration) and just say what you want to change in plain language. Claude will edit the file, deploy it to a preview address so you can check it, and then deploy to production when you say so.

Read [`CLAUDE.md`](./CLAUDE.md) for the full list of phrases Claude understands.

## Repo layout

```
sites/                      ← site content (this is what you edit)
  olzhas-coach.kz/
    index.html
  parusa.kz/
    index.html

CLAUDE.md                   ← instructions Claude follows in this repo
infra/                      ← server setup (don't touch — admin only)
.github/workflows/          ← deploy automation (don't touch — admin only)
docs/                       ← design notes
```

## Environments

| URL | What it is |
|---|---|
| https://olzhas-coach.kz | Production |
| https://preview.olzhas-coach.kz | Preview / drafts |
| https://parusa.kz | Production |
| https://preview.parusa.kz | Preview / drafts |

## Help

If something looks broken or you don't know what to do, ask Roman.
```

- [ ] **Step 2: Verify**

Run: `cat README.md | head -30`
Expected: file starts with the title and the two-site description.

---

### Task 18: Write `infra/README.md` (operator notes)

**Files:**
- Create: `infra/README.md`

- [ ] **Step 1: Create the file**

```markdown
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
6. Add DNS A records (apex, www, preview)
7. Re-run `sudo ./infra/scripts/bootstrap-vps.sh you@example.com` on the VPS — it picks up the new domain and issues certs

## Backups

The repo is the backup of site content. The bootstrap script is the backup of VPS state — burning down the VPS and rebuilding from scratch is one script run. Recommended: enable VPS provider snapshots in the hosting panel as a belt-and-suspenders.

## Monitoring

Not built into this setup. If you want uptime monitoring, point an external service (UptimeRobot, BetterUptime, etc.) at `https://olzhas-coach.kz/` and `https://parusa.kz/`. Free tier on most providers is enough for two sites.
```

- [ ] **Step 2: Verify**

Run: `wc -l infra/README.md`
Expected: between 100 and 200 lines.

---

## Phase D — Manual setup checklist (tasks 19–24)

These tasks are done by the operator (you), not by Claude. They are listed here because the project is not "done" until they are complete. Each should be checked off before declaring success.

### Task 19: DNS setup

- [ ] **Step 1: At the registrar for `olzhas-coach.kz`, create three A records:**

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `194.32.142.140` | 300 |
| A | `www` | `194.32.142.140` | 300 |
| A | `preview` | `194.32.142.140` | 300 |

- [ ] **Step 2: At the registrar for `parusa.kz`, create the same three A records (same IP).**

- [ ] **Step 3: Verify propagation**

Run: `dig olzhas-coach.kz +short && dig www.olzhas-coach.kz +short && dig preview.olzhas-coach.kz +short && dig parusa.kz +short && dig www.parusa.kz +short && dig preview.parusa.kz +short`
Expected: each prints `194.32.142.140`. If any are blank, wait 10 minutes and retry. Do NOT proceed to Task 21 (bootstrap) until all six resolve.

---

### Task 20: Push the repo to GitHub

- [ ] **Step 1: Confirm with the user that they want to commit and push.** Per global rules, never commit without explicit request.

- [ ] **Step 2: Once approved, stage everything and commit on `main`**

```bash
git add -A
git status   # show user what will be committed; let them confirm
git commit -m "Restructure repo for VPS hosting and CI/CD"
```

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Create the `preview` branch from `main` and push**

```bash
git checkout -b preview
git push -u origin preview
git checkout main
```

---

### Task 21: Run `bootstrap-vps.sh` on the VPS

- [ ] **Step 1: SSH to the VPS as `ubuntu`**

```bash
ssh ubuntu@194.32.142.140
```

- [ ] **Step 2: Clone the repo**

```bash
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/<owner>/<repo>.git ~/sites
cd ~/sites
```

- [ ] **Step 3: Run the bootstrap script with your email**

```bash
sudo ./infra/scripts/bootstrap-vps.sh you@example.com
```

Expected: script runs through 12 numbered steps, prints "Bootstrap complete." at the end with the values to copy into GitHub secrets.

- [ ] **Step 4: Capture the output**

Save the printed `VPS_SSH_KEY`, `VPS_SSH_KNOWN_HOSTS` values somewhere temporary (a local note), so you can paste them into GitHub secrets in the next task.

- [ ] **Step 5: Smoke-test the placeholder pages**

Run (from the VPS or your laptop): `curl -I https://olzhas-coach.kz` and `curl -I https://preview.olzhas-coach.kz` and the same for `parusa.kz`.
Expected: HTTP/2 200, valid certificate, `Server: nginx`. The placeholder "Coming soon" page is served.

---

### Task 22: Set GitHub repo secrets and branch protection

- [ ] **Step 1: In the GitHub repo Settings → Secrets and variables → Actions, add four repo secrets:**

| Name | Value (from bootstrap output) |
|---|---|
| `VPS_HOST` | `194.32.142.140` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | (the multiline private key — paste exactly, including BEGIN/END lines) |
| `VPS_SSH_KNOWN_HOSTS` | (the single-line ssh-keyscan output) |

- [ ] **Step 2: In Settings → Branches, add a branch protection rule for `main`:**

- Branch name pattern: `main`
- ✅ Require a pull request before merging — OR — restrict push access to your GitHub username only
- ✅ Block force pushes
- ✅ Restrict deletions

- [ ] **Step 3: Add a branch protection rule for `preview`:**

- Branch name pattern: `preview`
- ✅ Block force pushes
- ✅ Restrict deletions
- (Push is allowed — the friend's edits land here)

---

### Task 23: First end-to-end deploy smoke test

- [ ] **Step 1: Make a trivial visible change to one site on the `preview` branch**

Locally: `git checkout preview`, edit `sites/olzhas-coach.kz/index.html` to add a comment like `<!-- e2e test 2026-04-07 -->` near the top, commit and push.

- [ ] **Step 2: Watch the GitHub Actions run for `Deploy preview`**

- It should detect `olzhas-coach.kz` as the changed site
- rsync should succeed
- `deploy-receive.sh` should exit 0
- The summary should print `https://preview.olzhas-coach.kz`

- [ ] **Step 3: Verify in a browser**

Open `https://preview.olzhas-coach.kz`. Expected: the real site loads (not the placeholder), with valid HTTPS, and `view-source:` shows the comment you added.

- [ ] **Step 4: Verify noindex header**

Run: `curl -sI https://preview.olzhas-coach.kz | grep -i x-robots-tag`
Expected: `x-robots-tag: noindex, nofollow, noarchive`

Run: `curl -s https://preview.olzhas-coach.kz/robots.txt`
Expected: `User-agent: *\nDisallow: /`

- [ ] **Step 5: Promote to prod via natural-language flow**

Locally: `git checkout main && git merge --ff-only preview && git push origin main && git checkout preview`

- [ ] **Step 6: Watch the `Deploy production` workflow**

Expected: passes the guard step (commit is reachable from preview), deploys, prints `https://olzhas-coach.kz`.

- [ ] **Step 7: Verify prod**

Open `https://olzhas-coach.kz`. Expected: the real site, no `X-Robots-Tag: noindex` header.

Run: `curl -sI https://olzhas-coach.kz | grep -i x-robots-tag`
Expected: no output (no noindex header on prod).

- [ ] **Step 8: Repeat steps 1–7 for `parusa.kz`** to verify both sites independently work end-to-end.

---

### Task 24: Final verification — guard rejects bad commits

- [ ] **Step 1: Try to commit directly to `main` (should be blocked by branch protection)**

Locally: `git checkout main`, make a trivial edit, commit, push.
Expected: GitHub rejects the push with "protected branch" error. If it does NOT reject, branch protection isn't configured correctly — go back to Task 22 step 2.

- [ ] **Step 2: Verify the prod-deploy guard**

If branch protection allows you to bypass (you're an admin), do that intentionally for a test, push to `main` directly with a commit that's NOT on `preview`. Expected: the `Deploy production` workflow's `guard` job fails with "This commit was not promoted via the preview branch." Revert and clean up afterwards.

- [ ] **Step 3: Verify rollback**

On `main`, find a recent commit, run `git revert <sha> && git push origin main`. The site should serve the previous version within ~1 minute.

---

## Self-review

**1. Spec coverage:**

- ✅ Repo layout — Tasks 1, 2, 3
- ✅ VPS architecture (nginx, certbot, users, atomic deploys, allowlist) — Tasks 4, 5, 6–12, 13
- ✅ Two-branch flow with guard — Tasks 14, 15
- ✅ CLAUDE.md (bilingual, allowlist, hard-no list, phrase mapping) — Task 16
- ✅ README.md — Task 17
- ✅ infra/README.md — Task 18
- ✅ DNS setup — Task 19
- ✅ GitHub secrets + branch protection — Tasks 20, 22
- ✅ Bootstrap on VPS — Task 21
- ✅ End-to-end smoke test (preview, prod, noindex, rollback) — Tasks 23, 24
- ✅ Security: restricted SSH wrapper, input validation, UFW, fail2ban, unattended-upgrades — Task 13
- ✅ Rollback story — covered in Task 24 step 3 and CLAUDE.md

**2. Placeholder scan:** No TBDs, no TODOs, no "implement later." Every step has either complete code or an exact command.

**3. Type/name consistency check:**
- `deploy-receive.sh` arg order: `<domain> <env> <timestamp>` — consistent across script, tests, and workflows ✅
- Symlink path: `/var/www/sites/<domain>/<env>/current` — consistent across nginx configs, deploy script, bootstrap, README ✅
- Secret names: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_KNOWN_HOSTS` — consistent across both workflows, infra/README, Task 22 ✅
- `DEPLOY_BASE_DIR` env var for tests — defined in Task 7, used in Task 6 setup ✅
- Branch names: `main`, `preview` — consistent throughout ✅

No issues found.
