const express = require('express');
const bcryptjs = require('bcryptjs');
const db = require('../db/postgres');

const router = express.Router();

// Simple in-memory rate limit on failed logins: 10 failures per IP per
// 15 minutes. Enough to blunt credential stuffing on a small internal app
// without adding a dependency.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failedLogins = new Map();

function pruneFailures(now) {
  for (const [key, entry] of failedLogins) {
    if (now - entry.first > WINDOW_MS) failedLogins.delete(key);
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  pruneFailures(now);
  const entry = failedLogins.get(ip);
  return Boolean(entry && entry.count >= MAX_FAILURES);
}

function recordFailure(ip) {
  const now = Date.now();
  const entry = failedLogins.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    failedLogins.set(ip, { first: now, count: 1 });
  } else {
    entry.count += 1;
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid credentials format' });
  }
  if (isRateLimited(req.ip)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }

  try {
    const result = await db.query(
      'SELECT id, username, email, password, role FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];
    if (!user || !bcryptjs.compareSync(password, user.password)) {
      recordFailure(req.ip);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    failedLogins.delete(req.ip);
    // Regenerate the session on login to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
      res.json({ user: req.session.user });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

module.exports = router;
