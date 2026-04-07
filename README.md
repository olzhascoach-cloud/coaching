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
