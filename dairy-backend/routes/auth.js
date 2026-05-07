const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, farm_name, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const existing = await pool.query('SELECT id FROM farmers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO farmers (name, email, password, farm_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, farm_name, phone, created_at`,
      [name, email, hashed, farm_name || null, phone || null]
    );

    const farmer = result.rows[0];
    const token  = jwt.sign({ id: farmer.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({ token, farmer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM farmers WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const farmer = result.rows[0];
    const match  = await bcrypt.compare(password, farmer.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: farmer.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    const { password: _, ...farmerData } = farmer;
    res.json({ token, farmer: farmerData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});
// Update farmer profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  const { name, farm_name, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE farmers SET
         name      = COALESCE($1, name),
         farm_name = $2,
         phone     = $3
       WHERE id = $4
       RETURNING id, name, email, farm_name, phone, created_at`,
      [name || null, farm_name || null, phone || null, req.farmerId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;