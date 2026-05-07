const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

router.use(auth);

// Get monthly total for a cow (must be before /cow/:cowId)
router.get('/cow/:cowId/monthly', async (req, res) => {
  const { month, year } = req.query;
  try {
    const result = await pool.query(
      `SELECT 
         SUM(total) as monthly_total,
         SUM(morning) as morning_total,
         SUM(afternoon) as afternoon_total,
         SUM(evening) as evening_total,
         COUNT(*) as days_recorded
       FROM milk_logs
       WHERE cow_id = $1 
         AND farmer_id = $2
         AND EXTRACT(MONTH FROM log_date) = $3
         AND EXTRACT(YEAR FROM log_date) = $4`,
      [req.params.cowId, req.farmerId, month, year]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch monthly totals' });
  }
});

// Get all milk logs for a specific cow
router.get('/cow/:cowId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM milk_logs 
       WHERE cow_id = $1 AND farmer_id = $2
       ORDER BY log_date DESC`,
      [req.params.cowId, req.farmerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch milk logs' });
  }
});

// Add or update a milk log (one per day)
router.post('/', async (req, res) => {
  const { cow_id, log_date, morning, afternoon, evening } = req.body;

  if (!cow_id || !log_date) {
    return res.status(400).json({ error: 'cow_id and log_date are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO milk_logs (cow_id, farmer_id, log_date, morning, afternoon, evening)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (cow_id, log_date) DO UPDATE SET
         morning   = EXCLUDED.morning,
         afternoon = EXCLUDED.afternoon,
         evening   = EXCLUDED.evening
       RETURNING *`,
      [cow_id, req.farmerId, log_date, morning || 0, afternoon || 0, evening || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save milk log' });
  }
});

// Delete a milk log
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM milk_logs WHERE id = $1 AND farmer_id = $2 RETURNING id',
      [req.params.id, req.farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milk log not found' });
    }
    res.json({ message: 'Milk log deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete milk log' });
  }
});

module.exports = router;