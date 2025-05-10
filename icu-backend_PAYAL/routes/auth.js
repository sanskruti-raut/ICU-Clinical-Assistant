const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'vitalwatch-secret-key';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email, role`,
      [email, password_hash, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('Login successful for user:', user.email);
    console.log('Token created with payload:', { id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('GET /me - User from token:', req.user);
    
    if (!req.user || !req.user.id) {
      console.log('GET /me - No user or user.id in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [userId]
    );

    console.log('GET /me - Database query result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization');
  console.log('authenticateToken - Auth header:', authHeader);

  if (!authHeader) {
    console.log('authenticateToken - No auth header provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Extract token - expect "Bearer TOKEN"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('authenticateToken - Invalid token format');
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  const token = parts[1];
  console.log('authenticateToken - Token extracted:', token.substring(0, 20) + '...');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('authenticateToken - Token verified:', verified);
    req.user = verified;
    next();
  } catch (error) {
    console.error('authenticateToken - Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { router, authenticateToken };
