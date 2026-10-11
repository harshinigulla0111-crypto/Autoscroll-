const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'autoscroll_secure_jwt_secret_phase1_2026';

/**
 * Authentication Middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

/**
 * POST /api/auth/register
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Valid email and 6+ char password required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (db.isConnected()) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'Account already exists with this email.' });
      }

      const newUser = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [cleanEmail, hashedPassword]
      );
      const user = newUser.rows[0];

      // Initialize default reading profile and settings for user
      await db.query(
        'INSERT INTO reading_profiles (user_id) VALUES ($1)',
        [user.id]
      );
      await db.query(
        'INSERT INTO user_settings (user_id) VALUES ($1)',
        [user.id]
      );

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { id: user.id, email: user.email }
      });
    } else {
      // Offline fallback token
      const offlineId = `usr-${Date.now()}`;
      const token = jwt.sign({ id: offlineId, email: cleanEmail }, JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        success: true,
        message: 'Offline account session initialized',
        token,
        user: { id: offlineId, email: cleanEmail }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration failed.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (db.isConnected()) {
      const userRes = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const user = userRes.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email }
      });
    } else {
      const offlineId = `usr-${Date.now()}`;
      const token = jwt.sign({ id: offlineId, email: cleanEmail }, JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        success: true,
        message: 'Offline login session initialized',
        token,
        user: { id: offlineId, email: cleanEmail }
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/auth/me', authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }
  res.json({ success: true, user: req.user });
});

module.exports = { router, authenticateToken };
