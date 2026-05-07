const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

router.use(auth);

// Get all breeding records for a specific cow
router.get('/cow/:cowId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM breeding_records 
       WHERE cow_id = $1 AND farmer_id = $2
       ORDER BY insemination_date DESC`,
      [req.params.cowId, req.farmerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch breeding records' });
  }
});

// Get all breeding records for the farmer
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT br.*, c.cow_id as cow_code, c.name as cow_name 
       FROM breeding_records br
       JOIN cows c ON c.id = br.cow_id
       WHERE br.farmer_id = $1
       ORDER BY br.insemination_date DESC`,
      [req.farmerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch breeding records' });
  }
});

// Add a breeding record
router.post('/', async (req, res) => {
    const { cow_id, heat_date, insemination_date, semen_breed, semen_batch, notes } = req.body;
  
    if (!cow_id || !insemination_date) {
      return res.status(400).json({ error: 'cow_id and insemination_date are required' });
    }
  
    try {
      const result = await pool.query(
        `INSERT INTO breeding_records 
           (cow_id, farmer_id, heat_date, insemination_date, semen_breed, semen_batch, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [cow_id, req.farmerId, heat_date || null, insemination_date, semen_breed || null, semen_batch || null, notes || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add breeding record' });
    }
  });

// Update a breeding record (for when calving happens)
router.put('/:id', async (req, res) => {
  const { calving_date, num_calves, calf_gender, outcome, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE breeding_records SET
         calving_date = $1,
         num_calves   = $2,
         calf_gender  = $3,
         outcome      = $4,
         notes        = $5
       WHERE id = $6 AND farmer_id = $7
       RETURNING *`,
      [calving_date || null, num_calves || null, calf_gender || null, outcome || 'Pending', notes || null, req.params.id, req.farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Breeding record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update breeding record' });
  }
});

// Delete a breeding record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM breeding_records WHERE id = $1 AND farmer_id = $2 RETURNING id',
      [req.params.id, req.farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Breeding record not found' });
    }
    res.json({ message: 'Breeding record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete breeding record' });
  }
});

module.exports = router;