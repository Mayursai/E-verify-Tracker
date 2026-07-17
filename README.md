# E-Verify Tracker

Internal web app for managing employee e-verify requests, with role-based
access for Employees, Employers, and HR.

- **Employee** — submits requests (name, email, start date, custom fields), tracks their status, and can edit a request while it is still Applied
- **Employer** — reviews applied requests, approves/rejects with a comment, and can edit request details
- **HR** — marks requests In Progress when they start on them, sets any status, deletes requests, edits details, manages custom form fields, sees statistics

Request statuses shown in the app: **Applied → In Progress (HR working on it) → Approved / Rejected → Completed**.

Extras: dark/light mode, filtering and sorting, reviewer comment history,
and auto-deletion of Rejected/Completed requests 10 days after resolution
(daily cron at midnight).

## Run it locally

Needs Node 18+ and any PostgreSQL database.

```bash
npm install
DATABASE_URL=postgresql://user:password@localhost:5432/everify npm start
```

Open http://localhost:3000. Tables are created and demo users are seeded
automatically on first start:

| Role     | Username    | Password    |
|----------|-------------|-------------|
| Employee | `emp1`      | `password123` |
| Employer | `employer1` | `password123` |
| HR       | `hr1`       | `password123` |

> Change these (in `initializeDefaultUsers()` in `server.js`) before any
> real deployment.

## Deploy for free (Render + Supabase)

1. **Database** — create a free project at [supabase.com](https://supabase.com),
   then copy the **Session pooler** connection string from **Connect**
   (not "Direct connection" — that host is IPv6-only and Render can't reach it).
2. **App** — create a free **Web Service** at [render.com](https://render.com)
   from this repo. `render.yaml` configures everything; when prompted, paste
   the Supabase string as `DATABASE_URL`.
3. Done. First startup creates the schema and demo users.

Both free tiers sleep when idle and wake automatically on the next visit.

## Configuration

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | Postgres connection string |
| `SESSION_SECRET` | in production | Long random string (render.yaml auto-generates it) |
| `NODE_ENV` | in production | Set to `production` |
| `DATABASE_SSL` | no | `true`/`false` to override TLS auto-detection |
| `PG_POOL_MAX` | no | Max DB connections (default 5) |

See `.env.example` for a local template.

## Project structure

```
server.js            # Express server, session config, cron cleanup, user seeding
db/postgres.js       # Connection pool + schema initialization
routes/
  auth.js            # POST /api/auth/login, /logout; GET /me (rate-limited login)
  requests.js        # CRUD for requests, role-based rules
  admin.js           # Custom fields + stats (HR)
  middleware.js      # requireAuth / requireRole
public/              # Login page + three dashboards (vanilla HTML/CSS/JS)
render.yaml          # One-click Render deployment
```

## API

| Method | Path | Who |
|--------|------|-----|
| POST | `/api/auth/login` | anyone |
| POST | `/api/auth/logout` | signed in |
| GET | `/api/auth/me` | signed in |
| GET | `/api/requests` | own (employee) / all (employer, HR) |
| POST | `/api/requests` | employee |
| PUT | `/api/requests/:id` | employer (approve/reject), HR (any status) |
| PUT | `/api/requests/:id/details` | employee (own, while Applied), employer, HR |
| GET | `/api/requests/:id/comments` | same visibility as the request |
| DELETE | `/api/requests/:id` | HR |
| GET | `/api/admin/fields` | signed in |
| POST/DELETE | `/api/admin/fields[/:id]` | HR |
| GET | `/api/admin/stats` | HR |

## Security

Bcrypt password hashing, Postgres-backed sessions (regenerated on login),
login rate limiting (10 failures / 15 min per IP), role checks on every
endpoint, parameterized SQL, HTML-escaped output, security headers
(CSP, HSTS, X-Frame-Options), `sameSite` cookies, and request body limits.

## License

ISC
