require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const bcryptjs = require('bcryptjs');
const db = require('./db/postgres');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Behind Render/Heroku/etc. the app sits behind a TLS-terminating proxy;
// without this, secure cookies are never set and login breaks in production.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  });
  if (isProduction) {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Middleware
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

if (isProduction && !process.env.SESSION_SECRET) {
  console.warn('⚠ SESSION_SECRET is not set - using an insecure default. Set it in your environment.');
}

// Session configuration. In production (or whenever DATABASE_URL is set),
// sessions are stored in Postgres so they survive restarts and don't leak
// memory the way the default MemoryStore does.
const pgSession = require('connect-pg-simple')(session);
app.use(session({
  store: process.env.DATABASE_URL
    ? new pgSession({ pool: db.pool, createTableIfMissing: true })
    : undefined,
  secret: process.env.SESSION_SECRET || 'everify-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Auto-delete completed requests after 7 days
cron.schedule('0 0 * * *', async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  try {
    const result = await db.query(
      `DELETE FROM requests 
       WHERE request_status = 'completed' 
       AND completed_date < $1::date`,
      [sevenDaysAgo]
    );
    console.log(`Deleted ${result.rowCount} old completed requests`);
  } catch (error) {
    console.error('Error deleting old completed requests:', error);
  }
});

// Initialize default users if not exist
async function initializeDefaultUsers() {
  const users = [
    { username: 'emp1', email: 'emp1@company.com', password: 'password123', role: 'employee' },
    { username: 'emp2', email: 'emp2@company.com', password: 'password123', role: 'employee' },
    { username: 'employer1', email: 'employer1@company.com', password: 'password123', role: 'employer' },
    { username: 'hr1', email: 'hr1@company.com', password: 'password123', role: 'hr' }
  ];

  for (let user of users) {
    try {
      const hashedPassword = bcryptjs.hashSync(user.password, 10);
      await db.query(
        `INSERT INTO users (username, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (username) DO NOTHING`,
        [user.username, user.email, hashedPassword, user.role]
      );
    } catch (error) {
      console.error('Error initializing user:', user.username, error.message);
    }
  }
  console.log('✓ Default users initialized');
}

// Start server
async function startServer() {
  try {
    // Test database connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Initialize database schema
    await db.initializeDatabase();

    // Initialize default users
    await initializeDefaultUsers();

    app.listen(PORT, () => {
      console.log(`✓ Server running at http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.pool.end();
  process.exit(0);
});

startServer();
