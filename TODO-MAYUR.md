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

`server.js` seeds four demo users (`emp1`, `emp2`, `employer1`, `hr1`)
with the password `password123`. That is fine for local testing but must
not reach production. Either:

- change the passwords in `initializeDefaultUsers()` in `server.js`, or
- remove the seeding entirely once real accounts exist.

Also remove the demo credentials box from `public/login.html` at the same
time.

## 3. Set up the Supabase database (one-time, ~5 minutes)

The app is now configured for Supabase (free forever, no 30-day expiry like
Render's Postgres). Only you can do this part because it needs your account:

1. Go to <https://supabase.com> → sign up / sign in (free plan is fine).
2. **New project** → pick any name (e.g. `everify`), set a strong **database
   password** (save it!), choose a region close to your Render region.
3. When the project finishes provisioning, click **Connect** (top of the
   dashboard) and copy the **Session pooler** connection string. It looks
   like:
   `postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`
   — replace `<password>` with the database password from step 2.
   ⚠ Use the **Session pooler**, not "Direct connection": the direct host
   (`db.<ref>.supabase.co`) is IPv6-only and unreachable from Render's free
   tier, and session mode is required for the app's session store.
4. That string is your `DATABASE_URL`. No schema setup needed — the app
   creates all tables (and seeds demo users) automatically on first start.

Then set the environment variables wherever you deploy (Render dashboard →
your service → Environment):

- `DATABASE_URL` — the Supabase session-pooler string from step 3
- `SESSION_SECRET` — long random string (render.yaml auto-generates this)
- `NODE_ENV=production`

For local dev, copy `.env.example` to `.env` — you can point it at the same
Supabase database or any local Postgres.

## 4. Free-hosting note

All dependencies are free open-source packages and the app calls no paid
services. The permanently free setup this repo is now configured for:
**Render free web service + Supabase free Postgres**. Supabase's free tier
(500 MB database, pauses after 7 days of inactivity — it wakes on the next
connection) comfortably covers an internal tracker like this. Render's free
web service also sleeps after inactivity and wakes on the first request
(~30-60s cold start).

## 5. Cleanups — done ✅

The repo was simplified in a later commit: the six overlapping deployment
markdown files, the duplicate `package-prod.json`, and the unusable
`vercel.json` were deleted; `server-pg.js` / `requests-pg.js` / `admin-pg.js`
were renamed to `server.js` / `requests.js` / `admin.js`; and the README was
rewritten to match the real app (Postgres/Supabase, correct file names,
current setup steps). Nothing left to do here.
