const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

// Hosted Postgres (Supabase, Render, Neon, ...) requires TLS; a local dev
// database usually doesn't. DATABASE_SSL overrides the auto-detection.
function sslConfig() {
  if (process.env.DATABASE_SSL === 'false') return false;
  if (process.env.DATABASE_SSL === 'true') return { rejectUnauthorized: false };
  const isHosted = /supabase\.(co|com)|render\.com|neon\.tech/.test(connectionString || '');
  if (process.env.NODE_ENV === 'production' || isHosted) {
    return { rejectUnauthorized: false };
  }
  return false;
}

const pool = new Pool({
  connectionString,
  ssl: sslConfig(),
  // Supabase's free-tier pooler allows a small number of connections;
  // keep the app well under the cap.
  max: Number(process.env.PG_POOL_MAX) || 5,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('employee', 'employer', 'hr')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      start_date DATE NOT NULL,
      request_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (request_status IN ('pending', 'inprogress', 'approved', 'denied', 'completed')),
      comment TEXT,
      completed_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS custom_fields (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'select')),
      required BOOLEAN NOT NULL DEFAULT FALSE,
      options JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS request_comments (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      author TEXT NOT NULL,
      role TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS request_field_values (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      field_id INTEGER NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
      value TEXT,
      UNIQUE (request_id, field_id)
    );
  `);

  // Migration for databases created before the 'inprogress' status existed:
  // refresh the status check constraint so existing deployments accept it.
  await pool.query(`
    ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_request_status_check;
    ALTER TABLE requests ADD CONSTRAINT requests_request_status_check
      CHECK (request_status IN ('pending', 'inprogress', 'approved', 'denied', 'completed'));
  `);

  // completed_date now doubles as the resolution date for rejected requests
  // (the cleanup cron deletes both 10 days after it). Backfill any denied
  // rows from before this change so they don't linger forever.
  await pool.query(`
    UPDATE requests SET completed_date = CURRENT_DATE
    WHERE request_status = 'denied' AND completed_date IS NULL;
  `);

  console.log('✓ Database schema initialized');
}

module.exports = { pool, query, testConnection, initializeDatabase };
