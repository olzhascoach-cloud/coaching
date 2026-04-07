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

Russian: «покажи», «покажи изменения», «загрузи», «загрузи на превью», «выложи», «обнови превью», «давай посмотрим», «давай глянем», «залей», «отправь на превью», «хочу посмотреть»

**Disambiguation:** The Russian word «покажи» ("show") is ambiguous — it can mean "deploy to preview so I can see it" OR "show me what the file currently says." If the user just said something like "what's on the page?" or "what does this say?" without having asked for an edit first, treat «покажи» as a read request, not a deploy. If the user just made an edit request (or you just made one), treat «покажи» as a deploy-to-preview request.

**Action:**
1. Make sure you're on the `preview` branch. If it doesn't exist locally, create it from `main`: `git checkout -B preview origin/preview` (or from main if no remote preview).
2. Stage and commit the edits with a plain-English commit message describing what visibly changed (not "fix" or "update" — say what the user will *see*: e.g., "Update phone number on contact section").
3. Push: `git push origin preview`
4. Tell the user: "Pushed to preview. Once it finishes (about a minute), you can see it at:" and list the preview URLs for the sites that changed.
5. Do NOT switch back to main afterwards. The friend stays on `preview` between deploys. `main` is only touched during a prod promotion.

#### Phrases that mean **"deploy to production"**

English: "deploy to prod", "make it live", "publish", "ship it", "send to production", "push to prod", "looks good — go live"

Russian: «выкатывай», «публикуй», «в продакшн», «на боевой», «пускай в прод», «всё ок — выкатывай», «запускай», «готово, выкладывай», «можно публиковать», «окей, публикуй»

**Action:**
1. Verify `preview` is ahead of `main`: `git fetch origin && git rev-list --count main..preview`. If 0, tell the user "Nothing new to publish — preview matches production already" and stop.
2. Switch to main and fast-forward merge: `git checkout main && git merge --ff-only preview`. If FF fails (history diverged), STOP and tell the user "Something unusual happened — main has changes that aren't on preview. I need to ask Roman to sort this out before publishing."
3. Push: `git push origin main`
4. Switch back to preview: `git checkout preview`
5. Tell the user: "Published. Live in about a minute at:" and list the production URLs.

#### Phrases that mean **"roll back"**

English: "roll back", "undo", "revert", "go back", "the previous version was better", "restore the old one"

Russian: «откати», «откатись», «верни как было», «верни предыдущую версию», «отмени», «верни», «сделай как раньше», «всё сломалось» (if the user says this, propose rollback as the first option)

**Action:**
1. Confirm with the user which environment to roll back: prod or preview. Default to prod if unclear.
2. **For prod:** `git checkout main && git revert --no-edit HEAD && git push origin main && git checkout preview`. This creates a new commit that undoes the previous one — the deploy workflow runs again and serves the previous version.
3. **For preview:** `git checkout preview && git revert --no-edit HEAD && git push origin preview`. Stay on preview after.
4. Tell the user: "Reverted. Previous version will be live in about a minute."

### Editing rules

- **Always read a file before editing it.** Never guess at structure based on filename or memory.
- **Keep changes minimal.** If the user says "change the phone number," change only the phone number. Don't reformat the surrounding HTML, don't tidy up CSS, don't refactor.
- **Don't add new external scripts or stylesheets** unless the source domain is on the allowlist (below) and the user explicitly approved it.
- **Never put secrets in HTML.** No API keys, no passwords, no auth tokens. Static sites should have none of these.
- **Never disable the `noindex` on preview**, never delete `robots.txt`.

### Allowlist of external domains currently used

These are the only domains the sites currently load resources from. If the user asks to add a third-party widget, tracker, analytics, chat, or anything from a domain not on this list, ask first and explain in one sentence why ("this domain isn't currently used; adding it means the site loads code from someone else — is that what you want?").

- **Both sites:** `fonts.googleapis.com`, `fonts.gstatic.com` (Google Fonts — note that `fonts.gstatic.com` is loaded implicitly by the browser via Google Fonts CSS and does not appear as a literal URL in the HTML)
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
4. Touching the nginx-level noindex protection on preview (this lives in `infra/nginx/` and is already on the hard-no list — but the protection means: preview is blocked from search engines via HTTP headers and a robots.txt override served by nginx, NOT by the `robots.txt` files in `sites/`. You don't need to edit anything in `sites/` to control this.)
5. Deleting `sites/<any>/robots.txt` (these files are the production robots.txt — for preview, nginx serves a hard `Disallow: /` regardless of what's in this file)
6. Force-pushing, deleting branches, rebasing published commits, or amending pushed commits
7. Running shell commands on the VPS
8. Committing files outside `sites/` (unless the user explicitly says "yes I know this is unusual" — and even then double-check)
9. Adding tracking pixels, analytics scripts, or any third-party SDK without an explicit conversation about what data is collected

**How to refuse:** "That's outside what I'm allowed to do here — it could affect the server config or expose sensitive data. If you really need this, it requires a manual change by the site administrator (Roman)."

### When something breaks

- **Deploy failed (red ❌ on GitHub):** read the workflow logs, identify the failure (connection timeout, file validation error, SSL certificate issue, etc.), explain in plain language. Propose `roll back` as the first option if the user is panicking.
- **"The site looks broken":** ask which one (prod or preview), ask what they see, look at the last few commits on `main` (`git log --oneline -10 main`), propose rolling back the most recent change.
- **Never claim "fixed" until the next deploy succeeds.** Wait for confirmation.

### Things to remind the user when relevant

- **Preview ≠ production.** Preview shows drafts. Production is what visitors see.
- **DNS changes take time.** If a domain change just happened, wait 10 minutes before panicking.
- **"Show me what's currently live"** → run `git log --oneline -5 main` and read out the last few commit messages.
- **Browser cache:** if the user says "I changed the text but it still looks old," ask them to do a hard refresh (Cmd+Shift+R / Ctrl+Shift+F5).
