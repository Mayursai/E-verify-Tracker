# TODO for Mayur

Notes from the Claude session that rebuilt this app (2026-07-16). Everything
in this list is something only you can do — the code itself is done and
tested.

---

## 1. Fix git push access for Claude sessions (important)

During this session, **every** write path to this repository was rejected
with HTTP 403, while read access (clone/fetch) worked fine:

- `git push` → `403` (retried many times over ~15 minutes)
- GitHub API (`create branch` via the Claude GitHub integration) →
  `403 Resource not accessible by integration`

So the Claude environment currently has **read-only** access to
`Mayursai/E-verify-Tracker`. That's why nothing could be pushed and you
received the work as attached files instead.

Steps to fix:

1. Go to <https://github.com/settings/installations>.
2. Find the **Claude** GitHub App installation.
3. Open **Configure** and check:
   - `E-verify-Tracker` is in the list of repositories the app can access
     (or "All repositories" is selected).
   - The app has **Read and write** permission for **Contents**.
   - If GitHub is showing a pending "Review request" banner for updated
     permissions, approve it — a pending permission upgrade leaves the app
     read-only until you approve.
4. If you use claude.ai / Claude Code on the web, also check
   Settings → Integrations → GitHub there, and the session environment's
   repository access level (it must be write, not read-only).
5. Re-test by asking Claude in a new session to push a trivial commit to a
   scratch branch.

## 2. Apply the delivered work to the repo (manual, since push was blocked)

You should have received two files from the Claude session alongside this
one:

- `everify-branch.bundle` — the commits as a git bundle (recommended)
- `everify-changes.patch` — the same commits as a plain git patch (fallback)

**Option A — fetch from the bundle (recommended):**

```bash
cd path/to/E-verify-Tracker        # your local clone
git fetch path/to/everify-branch.bundle claude/general-review-wrako6:claude/general-review-wrako6
git checkout claude/general-review-wrako6
git push -u origin claude/general-review-wrako6
```

**Option B — apply the patch:**

```bash
cd path/to/E-verify-Tracker        # your local clone, on latest main
git checkout -b claude/general-review-wrako6 origin/main
git am --keep-cr -3 path/to/everify-changes.patch
git push -u origin claude/general-review-wrako6
```

Note the `--keep-cr` flag on `git am` — two files in the repo have Windows
(CRLF) line endings and the patch won't apply without it.

Either way you end up with the branch on GitHub, ready for a PR into `main`.

### What's in the commits

1. **Frontend**: adds `public/` (login page, employee/employer/HR dashboards,
   shared `styles.css` + `app.js`), and deletes two junk files that were
   accidentally committed (`script.js`, `login_temp.html`).
2. **Backend**: adds `db/postgres.js` and `routes/` (auth, requests, admin,
   middleware), fixes a login-page bug, and replaces the corrupt UTF-16
   `.gitignore` with a real one.

Everything was verified end-to-end against a local PostgreSQL 16: login for
all three roles, role-based authorization, custom-field enforcement, the
approve/deny/complete workflow, stats, and the full browser flow.

To run it locally after applying:

```bash
npm install
# point DATABASE_URL at any Postgres and run:
DATABASE_URL=postgresql://user:pass@localhost:5432/everify npm start
# then open http://localhost:3000 and log in with the demo users
# (emp1 / employer1 / hr1, all with password123 — see README.md)
```

When you're happy with it, open a PR from `claude/general-review-wrako6`
into `main` on GitHub and merge it.

## 3. Change the default user passwords before any real deployment

`server-pg.js` seeds four demo users (`emp1`, `emp2`, `employer1`, `hr1`)
with the password `password123`. That is fine for local testing but must
not reach production. Either:

- change the passwords in `initializeDefaultUsers()` in `server-pg.js`, or
- remove the seeding entirely once real accounts exist.

## 4. Set real environment variables when deploying

Copy `.env.example` to `.env` for local dev. For Render, `render.yaml`
already wires up `DATABASE_URL` and generates `SESSION_SECRET`
automatically. Whatever host you use, make sure these are set:

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — long random string (never the default)
- `NODE_ENV=production`

## 5. Optional cleanups (nice to have, not blocking)

- `package-prod.json` duplicates `package.json` and its `dev` script points
  at a `server.js` that doesn't exist. Consider deleting it or merging the
  `engines` field into `package.json`.
- The six deployment markdown files (`CLOUD_DEPLOYMENT.md`,
  `DEPLOYMENT_STEPS.md`, etc.) overlap heavily. Consider consolidating into
  one.
- README's "Database" section still says SQLite; the app now runs on
  PostgreSQL (`server-pg.js`). Update the docs when convenient.
