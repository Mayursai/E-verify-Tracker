const express = require('express');
const bcryptjs = require('bcryptjs');
const db = require('../db/postgres');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await db.query(
      'SELECT id, username, email, password, role FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];
    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
    res.json({ user: req.session.user });
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
