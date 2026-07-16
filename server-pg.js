require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const bcryptjs = require('bcryptjs');
const db = require('./db/postgres');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'everify-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests-pg'));
app.use('/api/admin', require('./routes/admin-pg'));

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
