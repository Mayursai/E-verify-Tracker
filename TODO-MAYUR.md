# TODO for Mayur

Notes from the Claude session that rebuilt this app (2026-07-16). Everything
in this list is something only you can do — the code itself is done, tested,
and pushed to the branch `claude/general-review-wrako6`.

---

## 1. Review and merge the branch `claude/general-review-wrako6` ✅ pushed

> Push access was initially blocked (403) but was fixed mid-session by
> installing/configuring the Claude GitHub App, and the branch is now on
> GitHub. The bundle/patch files sent earlier are no longer needed.

What's in the commits:

1. **Frontend**: adds `public/` (login page, employee/employer/HR dashboards,
   shared `styles.css` + `app.js`), and deletes two junk files that were
   accidentally committed (`script.js`, `login_temp.html`).
2. **Backend**: adds `db/postgres.js` and `routes/` (auth, requests, admin,
   middleware), fixes a login-page bug, and replaces the corrupt UTF-16
   `.gitignore` with a real one.
3. **Dark/light mode + security hardening**: theme toggle with localStorage
   persistence and OS-preference default; trust proxy (required for login to
   work on Render), Postgres-backed sessions, login rate limiting, session
   regeneration on login, security headers (CSP, HSTS, X-Frame-Options),
   sameSite cookies, body size limits, and id validation.

Everything was verified end-to-end against a local PostgreSQL 16: login for
all three roles, role-based authorization, custom-field enforcement, the
approve/deny/complete workflow, stats, rate limiting (429 after 10 failed
logins), security headers, and the full browser flow in both themes.

To run it locally:

```bash
git fetch origin claude/general-review-wrako6
git checkout claude/general-review-wrako6
npm install
# point DATABASE_URL at any Postgres and run:
DATABASE_URL=postgresql://user:pass@localhost:5432/everify npm start
# then open http://localhost:3000 and log in with the demo users
# (emp1 / employer1 / hr1, all with password123 — see README.md)
```

When you're happy with it, open a PR from `claude/general-review-wrako6`
into `main` on GitHub and merge it:
<https://github.com/Mayursai/E-verify-Tracker/pull/new/claude/general-review-wrako6>

## 2. Change the default user passwords before any real deployment

`server-pg.js` seeds four demo users (`emp1`, `emp2`, `employer1`, `hr1`)
with the password `password123`. That is fine for local testing but must
not reach production. Either:

- change the passwords in `initializeDefaultUsers()` in `server-pg.js`, or
- remove the seeding entirely once real accounts exist.

Also remove the demo credentials box from `public/login.html` at the same
time.

## 3. Set real environment variables when deploying

Copy `.env.example` to `.env` for local dev. For Render, `render.yaml`
already wires up `DATABASE_URL` and generates `SESSION_SECRET`
automatically. Whatever host you use, make sure these are set:

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — long random string (never the default)
- `NODE_ENV=production`

## 4. Free-hosting note

All dependencies are free open-source packages and the app calls no paid
services. Render's free web service works, but **Render's free Postgres
expires after ~30 days**. For a permanently free setup, keep the web service
on Render and point `DATABASE_URL` at a free-forever Postgres from Neon
(neon.tech) or Supabase (supabase.com).

## 5. Optional cleanups (nice to have, not blocking)

- `package-prod.json` duplicates `package.json` and its `dev` script points
  at a `server.js` that doesn't exist. Consider deleting it or merging the
  `engines` field into `package.json`.
- The six deployment markdown files (`CLOUD_DEPLOYMENT.md`,
  `DEPLOYMENT_STEPS.md`, etc.) overlap heavily. Consider consolidating into
  one.
- README's "Database" section still says SQLite; the app now runs on
  PostgreSQL (`server-pg.js`). Update the docs when convenient.
