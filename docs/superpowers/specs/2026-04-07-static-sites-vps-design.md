---
title: Static Sites VPS Hosting & Vibe-Coding Workflow
date: 2026-04-07
status: approved
---

# Static Sites VPS Hosting & Vibe-Coding Workflow

## Context

This repo contains two single-file static websites:
- `olzhas-coach.kz` — Olzhas Kundakbayev (ICF business coach), currently `index.html`
- `parusa.kz` — Kapchagay Yacht Club, currently `kapchagay-yacht-club.html`

The repo will be maintained by a non-technical user ("the friend") via Claude.ai web with GitHub integration. The friend speaks in natural language; Claude translates intent to git operations. There is no local terminal in the friend's workflow.

Hosting target is a fresh Ubuntu VPS at `194.32.142.140` (SSH user `ubuntu`). Both domains need HTTPS, both need a preview environment for "show me changes before going live."

## Goals

1. Both sites served over HTTPS from the VPS, with preview environments
2. Deploys triggered by git push, no manual VPS access during normal operation
3. A `CLAUDE.md` that pre-programs Claude's behavior so the friend can vibe-code safely
4. Structural guardrails (branch protection, restricted SSH, allowlists) so misbehavior is contained
5. Idempotent infrastructure: rebuilding the VPS from scratch is one script run
6. Easy rollback when something breaks

## Non-goals

- No build step, no Node, no static site generators — sites are hand-written HTML
- No CDN, WAF, or external monitoring (can be added later if needed)
- No staging database, no backend API
- No multi-region or HA — single VPS is sufficient for two small marketing sites

## Decision summary

| Decision | Choice | Why |
|---|---|---|
| Deploy workflow | Two-branch flow (`preview` → `main`) | Cleanest mapping of "draft → publish" to git, strongest rollback story |
| Web server | nginx | Standard, certbot integration, future-dev recognition |
| TLS | Let's Encrypt via certbot, auto-renew | Free, standard, no human in the loop after setup |
| Repo layout | Monorepo, `sites/<domain>/` | Single place for the friend, scales to N sites |
| Preview protection | `noindex` (robots.txt + `X-Robots-Tag`) | Lighter than basic auth, no password to remember |
| Rollback | Atomic symlinks + last 5 releases on disk | Instant rollback, no re-deploy needed |
| CI | GitHub Actions, push-triggered, rsync over SSH | Native to GitHub, no extra services |

---

## Architecture

### Repo layout

```
coaching/
├── sites/
│   ├── olzhas-coach.kz/
│   │   ├── index.html
│   │   ├── robots.txt              # production: allows indexing
│   │   └── assets/                 # images, fonts (when added)
│   └── parusa.kz/
│       ├── index.html
│       ├── robots.txt
│       └── assets/
├── .github/
│   └── workflows/
│       ├── deploy-preview.yml      # push to `preview` branch
│       └── deploy-prod.yml         # push to `main` branch
├── infra/
│   ├── nginx/
│   │   ├── olzhas-coach.kz.conf
│   │   └── parusa.kz.conf
│   ├── scripts/
│   │   ├── bootstrap-vps.sh        # one-time VPS setup (you run it)
│   │   └── deploy-receive.sh       # runs on VPS, validates input, atomic swap
│   └── README.md                   # operator notes (not for the friend)
├── docs/superpowers/specs/         # design docs
├── CLAUDE.md                       # bilingual: Russian summary + English instructions for Claude
├── README.md                       # short, friend-readable
└── .gitignore                      # secrets, keys, .env, .DS_Store
```

### VPS file layout

```
/var/www/sites/
├── olzhas-coach.kz/
│   ├── prod/
│   │   ├── current → releases/2026-04-07_143022/   # symlink, atomically swapped
│   │   └── releases/                                # last 5 retained, older pruned per deploy
│   │       ├── 2026-04-07_143022/
│   │       └── ...
│   └── preview/
│       ├── current → releases/...
│       └── releases/
└── parusa.kz/
    ├── prod/
    └── preview/
```

nginx serves `/var/www/sites/<domain>/<env>/current/`. Atomic deploys mean nginx never sees a half-uploaded site. Rollback = `ln -sfn` to a previous release.

### nginx server blocks

| Hostname | Document root | Notes |
|---|---|---|
| `olzhas-coach.kz` | `prod/current` | HTTP→HTTPS redirect |
| `www.olzhas-coach.kz` | — | 301 to apex |
| `preview.olzhas-coach.kz` | `preview/current` | `X-Robots-Tag: noindex, nofollow`, serves `noindex` robots.txt |
| `parusa.kz` | `prod/current` | HTTP→HTTPS redirect |
| `www.parusa.kz` | — | 301 to apex |
| `preview.parusa.kz` | `preview/current` | noindex |

TLS: one cert per domain covering all 3 hostnames, auto-renewal via certbot's systemd timer.

Logging: per-site access/error logs at `/var/log/nginx/<domain>.{access,error}.log`.

### VPS users and SSH

- `ubuntu` (existing) — sudo, used by you for admin
- `deploy` (new) — no sudo, owns `/var/www/sites/`, only used by GitHub Actions
- Root login disabled, SSH password auth disabled (already standard)
- `deploy` user's `~/.ssh/authorized_keys` uses a `command="..."` directive restricting the key to running only `/usr/local/bin/deploy-receive.sh`. Even if the key leaks, no shell access.

### `deploy-receive.sh` validation

Input parameters validated against an allowlist before any filesystem operation:
- `domain` ∈ {`olzhas-coach.kz`, `parusa.kz`} — hardcoded
- `env` ∈ {`prod`, `preview`}
- `timestamp` matches `^\d{4}-\d{2}-\d{2}_\d{6}$`

Rejects with non-zero exit and stderr log on any mismatch. Prevents path traversal.

### System packages

- `nginx`, `certbot`, `python3-certbot-nginx`, `rsync`
- `ufw` (firewall, default deny, allow 22/80/443)
- `fail2ban` (5 failed SSH attempts → 1 hour ban)
- `unattended-upgrades` (nightly security patches)

---

## CI/CD pipeline

### `deploy-preview.yml`

- **Trigger:** `push` to `preview` branch
- **Concurrency:** group `preview-deploy`, cancel-in-progress
- **Steps:**
  1. Checkout repo
  2. Detect changed sites: `git diff --name-only HEAD~1 HEAD -- sites/` → derive list of changed `<domain>` directories. On first deploy or force-push edge cases, deploy all sites.
  3. For each changed `<domain>`:
     - Generate timestamp `YYYY-MM-DD_HHMMSS`
     - `rsync -az --delete sites/<domain>/ deploy@VPS:/var/www/sites/<domain>/preview/releases/<timestamp>/`
     - SSH: `deploy-receive.sh <domain> preview <timestamp>` → atomic symlink swap + prune old releases
  4. Post deploy URL as workflow summary

### `deploy-prod.yml`

- **Trigger:** `push` to `main` branch
- **Pre-deploy guard:** verify the deployed commit is reachable from `origin/preview`. Fails fast if someone committed straight to main without going through preview.
- **Steps:** identical to preview, with `prod` substituted for `preview`

### Secrets (GitHub repo settings)

- `VPS_HOST` — `194.32.142.140`
- `VPS_USER` — `deploy`
- `VPS_SSH_KEY` — private key (Ed25519)
- `VPS_SSH_KNOWN_HOSTS` — VPS host fingerprint, prevents MITM during rsync

### Failure modes

| Failure | Effect on live site |
|---|---|
| rsync fails mid-upload | None — atomic symlink not swapped |
| SSH unreachable | None |
| `deploy-receive.sh` validation fails | None — script exits before touching `current` |
| Disk full on VPS | rsync fails, current release stays live; alert via failed workflow |

---

## Workflow mapping (natural language → git)

This is the contract `CLAUDE.md` will encode for the friend's Claude session.

### Phrases that mean "deploy to preview"
*"show me the changes", "let me see it", "upload", "deploy", "update preview", "push it", "покажи", "загрузи", "обнови превью"*

**Claude does:**
1. Ensure on `preview` branch (or create from `main` if missing)
2. Stage and commit edits with a plain-English message
3. Push to `origin/preview`
4. Wait for or describe how to check the deploy status
5. Reply with the preview URL(s) for any sites that changed

### Phrases that mean "deploy to prod"
*"deploy to prod", "make it live", "publish", "ship it", "send to production", "выкатывай", "публикуй", "в продакшн"*

**Claude does:**
1. Verify `preview` is ahead of `main` (otherwise: "nothing to promote")
2. Fast-forward merge `preview` into `main` locally
3. Push `main`
4. Reply with the production URL

### Phrases that mean "rollback"
*"undo", "revert", "go back", "the last version was better", "откати", "верни как было"*

**Claude does:**
1. `git revert` the last commit on `main` (or the last merge commit)
2. Push `main`
3. Confirms the previous version is now live after the deploy completes

### Hard rules
- Never commit directly to `main`. Prod is reached only by merging `preview` → `main` after the friend says a prod phrase.
- Never force-push, amend public commits, or rebase published branches.
- Never edit `infra/`, `.github/`, or `CLAUDE.md` itself without explicit permission AND a warning that this is admin territory.

---

## `CLAUDE.md` content outline

Bilingual: a short Russian summary at the top so the friend can read it himself, followed by detailed English instructions that Claude reads on every session.

1. **Russian summary (Краткое резюме)** — 1 paragraph in plain Russian explaining what Claude will and won't do
2. **Who you are talking to** — non-technical user, no jargon, no diffs unless asked
3. **Repo map** — what's editable, what's not
4. **Deploy workflow** — phrase → action mapping (full table)
5. **Editing rules** — only `sites/`, read before edit, minimal changes, no third-party scripts
6. **Commit rules** — one logical change, plain-English messages, no force-push
7. **Hard "no" list** — workflows, infra, secrets, third-party scripts, disabling noindex, deleting robots.txt, modifying CLAUDE.md
8. **Allowlist of external domains currently used:**
   - Both sites: `fonts.googleapis.com`, `fonts.gstatic.com`
   - Both sites: `wa.me` (WhatsApp deep links)
   - `parusa.kz` only: `instagram.com`
   - Adding any new external domain requires explicit friend approval
9. **When something breaks** — read workflow logs, propose rollback first
10. **Things the friend might forget** — preview vs prod, DNS propagation, "show me what's live"

Estimated length: 150–250 lines.

---

## Security & guardrails

### A. GitHub branch protection

- **`main`:** require PR before merging OR restrict push to specific user; block force-push; block branch deletion
- **`preview`:** block force-push; block branch deletion; allow push (this is where the friend's edits land)

Note: branch protection on a free private repo only enforces via API/web UI. Local force-push is mitigated by the CLAUDE.md hard rule.

### B. Restricted deploy SSH key

`~deploy/.ssh/authorized_keys`:
```
command="/usr/local/bin/deploy-receive.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA...
```

### C. Input validation in `deploy-receive.sh`

Hardcoded allowlist for domain and environment, regex-validated timestamp. See "deploy-receive.sh validation" above.

### D. Firewall

UFW default deny incoming, allow 22/80/443 only.

### E. fail2ban

Default SSH jail, 5 failures → 1h ban.

### F. Unattended security upgrades

Nightly via `unattended-upgrades` package.

### G. Third-party script allowlist

Encoded in `CLAUDE.md`. Adding any new external `<script>` or `<link>` source requires friend approval. The current allowlist is derived from the existing HTML files (see CLAUDE.md outline §8).

### H. Secrets

- `.gitignore` covers `.env`, `*.pem`, `*.key`, `id_rsa*`, `.DS_Store`
- CLAUDE.md instructs Claude to refuse if asked to commit anything that looks like a secret
- All deploy credentials live in GitHub Actions secrets, never in the repo

### I. Backup

- The repo is the source of truth for site content
- `infra/scripts/bootstrap-vps.sh` is the source of truth for VPS state — rebuilding the server is a single script run
- Recommend (but not required by this design) enabling VPS provider snapshots

### J. Explicitly out of scope

- WAF, CDN, external uptime monitoring, HSTS preload, staging database

---

## DNS

The friend (or you, before bootstrap) creates these records at the registrar for **each** of `olzhas-coach.kz` and `parusa.kz`:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `194.32.142.140` | 300 |
| A | `www` | `194.32.142.140` | 300 |
| A | `preview` | `194.32.142.140` | 300 |

Verify with `dig <domain> +short` before running the certbot step of bootstrap. Certbot requires resolvable DNS to issue certs.

---

## VPS bootstrap

`infra/scripts/bootstrap-vps.sh` runs interactively (needs your email + ToS confirmation for certbot). Idempotent. Steps:

1. `apt update && apt upgrade -y`
2. Install packages (nginx, certbot, rsync, ufw, fail2ban, unattended-upgrades)
3. Configure UFW (default deny, allow 22/80/443, enable)
4. Enable unattended-upgrades, fail2ban
5. Create `deploy` user, no sudo, owns `/var/www/sites/`
6. Generate `deploy@VPS` Ed25519 keypair, print public key
7. Create `/var/www/sites/{olzhas-coach.kz,parusa.kz}/{prod,preview}/releases/`
8. Drop "Coming soon" placeholder `index.html` into each `current/`
9. Install nginx server-block configs from `infra/nginx/`, symlink, test, reload
10. Run `certbot --nginx` for each domain (interactive)
11. Install `deploy-receive.sh` to `/usr/local/bin/`, mode 755, owner root
12. Print summary: SSH keys to copy into GitHub secrets, URLs to test

---

## GitHub one-time setup checklist

1. Create the GitHub repo (if not already)
2. Push the repo
3. Create empty `preview` branch from `main`
4. Add secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_KNOWN_HOSTS`
5. Configure branch protection per Security section A

---

## First-deploy smoke test

After bootstrap + first push to `preview`:
- `https://preview.olzhas-coach.kz` loads with valid cert
- `curl -I https://preview.olzhas-coach.kz` shows `X-Robots-Tag: noindex`
- After merging to `main`: `https://olzhas-coach.kz` shows the same content, no noindex header
- `curl -I http://olzhas-coach.kz` redirects to `https://`
- Repeat for `parusa.kz`

---

## Trade-offs and alternatives considered

| Considered | Chose | Why |
|---|---|---|
| Caddy (auto-TLS) | nginx + certbot | Standard, recognizable, rock-solid certbot integration |
| Single-branch + workflow_dispatch | Two-branch flow | Cleaner "what's in prod" answer, better rollback story |
| Tag-based prod (`prod-N`) | Two-branch flow | Less standard, tag accumulation |
| HTTP Basic Auth on preview | noindex only | No password to remember, lighter UX |
| Cloudflare in front | Direct VPS | Simpler DNS, no extra dependency. Easy to add later. |
| Pre-commit hooks | None | Friend wouldn't install them |
| Separate `SECURITY.md` | All in `CLAUDE.md` | Claude only reliably loads `CLAUDE.md` |
| Rsync without `--delete` | With `--delete` | Otherwise removed files linger forever; safe because `--delete` operates within a fresh release dir, not against live traffic |

---

## Future extensions (not in this design)

- Add a third site → drop `sites/<new-domain>/` + `infra/nginx/<new-domain>.conf` + DNS records + re-run bootstrap's nginx/certbot steps
- Cloudflare in front → DNS-only change + UFW allow Cloudflare IPs only on 443
- Uptime monitoring → external service (UptimeRobot, etc.) hitting `https://<domain>/`
- Image optimization or asset pipeline → would introduce a build step; deferred until actually needed
