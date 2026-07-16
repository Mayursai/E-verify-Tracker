const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
        CHECK (request_status IN ('pending', 'approved', 'denied', 'completed')),
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

    CREATE TABLE IF NOT EXISTS request_field_values (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      field_id INTEGER NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
      value TEXT,
      UNIQUE (request_id, field_id)
    );
  `);
  console.log('✓ Database schema initialized');
}

module.exports = { pool, query, testConnection, initializeDatabase };
