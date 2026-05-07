const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

router.use(auth);

// Get all cows
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cows WHERE farmer_id = $1 ORDER BY cow_id',
      [req.farmerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cows' });
  }
});

// Get single cow
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cows WHERE id = $1 AND farmer_id = $2',
      [req.params.id, req.farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cow not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cow' });
  }
});

// Add cow
router.post('/', async (req, res) => {
  const { cow_id, name, breed, color, date_of_birth, health_status } = req.body;

  if (!cow_id) {
    return res.status(400).json({ error: 'cow_id is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cows (farmer_id, cow_id, name, breed, color, date_of_birth, health_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.farmerId, cow_id, name || null, breed || null, color || null, date_of_birth || null, health_status || 'Healthy']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Cow ID "${cow_id}" already exists` });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to add cow' });
  }
});

// Update cow
router.put('/:id', async (req, res) => {
  const { cow_id, name, breed, color, date_of_birth, health_status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cows SET
         cow_id        = COALESCE($1, cow_id),
         name          = $2,
         breed         = $3,
         color         = $4,
         date_of_birth = $5,
         health_status = COALESCE($6, health_status)
       WHERE id = $7 AND farmer_id = $8
       RETURNING *`,
      [cow_id, name, breed, color, date_of_birth, health_status, req.params.id, req.farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cow not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cow' });
  }
});

// Delete cow
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cows WHERE id = $1 AND farmer_id = $2 RETURNING id',
      [req.params.id, req.farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cow not found' });
    }
    res.json({ message: 'Cow deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete cow' });
  }
});

module.exports = router;