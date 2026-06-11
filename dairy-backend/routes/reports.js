const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

router.use(auth);

router.get('/monthly', async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  try {
    // Get farmer info
    const farmerResult = await pool.query(
      'SELECT name, farm_name, email, phone FROM farmers WHERE id = $1',
      [req.farmerId]
    );
    const farmer = farmerResult.rows[0];

    // Get all cows
    const cowsResult = await pool.query(
      'SELECT * FROM cows WHERE farmer_id = $1 ORDER BY cow_id',
      [req.farmerId]
    );

    // Get milk logs for the month
    const milkResult = await pool.query(
      `SELECT ml.*, c.cow_id as cow_code, c.name as cow_name
       FROM milk_logs ml
       JOIN cows c ON c.id = ml.cow_id
       WHERE ml.farmer_id = $1
         AND EXTRACT(MONTH FROM ml.log_date) = $2
         AND EXTRACT(YEAR FROM ml.log_date) = $3
       ORDER BY c.cow_id, ml.log_date`,
      [req.farmerId, month, year]
    );

    // Get breeding records for the month
    const breedingResult = await pool.query(
      `SELECT br.*, c.cow_id as cow_code, c.name as cow_name
       FROM breeding_records br
       JOIN cows c ON c.id = br.cow_id
       WHERE br.farmer_id = $1
         AND EXTRACT(MONTH FROM br.insemination_date) = $2
         AND EXTRACT(YEAR FROM br.insemination_date) = $3
       ORDER BY c.cow_id, br.insemination_date`,
      [req.farmerId, month, year]
    );

    // Get milk summary per cow
    const summaryResult = await pool.query(
      `SELECT 
         c.cow_id as cow_code,
         c.name as cow_name,
         c.breed,
         c.health_status,
         COALESCE(SUM(ml.total), 0) as total_milk,
         COALESCE(COUNT(ml.id), 0) as days_recorded,
         COALESCE(AVG(ml.total), 0) as daily_average
       FROM cows c
       LEFT JOIN milk_logs ml ON ml.cow_id = c.id
         AND EXTRACT(MONTH FROM ml.log_date) = $2
         AND EXTRACT(YEAR FROM ml.log_date) = $3
       WHERE c.farmer_id = $1
       GROUP BY c.id, c.cow_id, c.name, c.breed, c.health_status
       ORDER BY c.cow_id`,
      [req.farmerId, month, year]
    );

    res.json({
      farmer,
      month,
      year,
      cows: cowsResult.rows,
      milkLogs: milkResult.rows,
      breedingRecords: breedingResult.rows,
      summary: summaryResult.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;