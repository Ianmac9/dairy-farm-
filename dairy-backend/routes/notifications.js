const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');
const sendSMS = require('../sms');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const notifications = [];

    // Get farmer phone number
    const farmerResult = await pool.query(
      'SELECT phone, name FROM farmers WHERE id = $1',
      [req.farmerId]
    );
    const farmer = farmerResult.rows[0];

    // Get all breeding records
    const breeding = await pool.query(
      `SELECT br.*, c.cow_id as cow_code, c.name as cow_name
       FROM breeding_records br
       JOIN cows c ON c.id = br.cow_id
       WHERE br.farmer_id = $1`,
      [req.farmerId]
    );

    for (const record of breeding.rows) {
      const insemDate = new Date(record.insemination_date);
      const expectedCalving = new Date(record.expected_calving_date);
      const daysToCalving = Math.ceil((expectedCalving - today) / (1000 * 60 * 60 * 24));
      const daysSinceInsem = Math.ceil((today - insemDate) / (1000 * 60 * 60 * 24));
      const cowLabel = `${record.cow_code}${record.cow_name ? ' (' + record.cow_name + ')' : ''}`;

      if (record.outcome === 'Pending') {

        // Heat notification (21 days after insemination)
        if (daysSinceInsem >= 18 && daysSinceInsem <= 24) {
          const msg = `🌡️ DAIRY FARM ALERT: ${cowLabel} may be on heat again. Inseminated ${daysSinceInsem} days ago. Check for heat signs.`;
          notifications.push({ type: 'heat', priority: 'high', cow_id: record.cow_id, cow_code: record.cow_code, cow_name: record.cow_name, message: `${cowLabel} may be on heat`, detail: `Inseminated ${daysSinceInsem} days ago.` });
          if (farmer.phone) await sendSMS(farmer.phone, msg);
        }

        // Pregnancy check (28-35 days after insemination)
        if (daysSinceInsem >= 28 && daysSinceInsem <= 35) {
          const msg = `🔬 DAIRY FARM ALERT: Pregnancy check due for ${cowLabel}. It has been ${daysSinceInsem} days since insemination.`;
          notifications.push({ type: 'pregnancy_check', priority: 'medium', cow_id: record.cow_id, cow_code: record.cow_code, cow_name: record.cow_name, message: `Pregnancy check due for ${cowLabel}`, detail: `${daysSinceInsem} days since insemination.` });
          if (farmer.phone) await sendSMS(farmer.phone, msg);
        }

        // Calving due soon (within 14 days)
        if (daysToCalving >= 0 && daysToCalving <= 14) {
          const msg = `🐄 DAIRY FARM ALERT: ${cowLabel} is due to calve in ${daysToCalving} days. Expected: ${expectedCalving.toLocaleDateString()}. Prepare calving area.`;
          notifications.push({ type: 'calving_soon', priority: 'high', cow_id: record.cow_id, cow_code: record.cow_code, cow_name: record.cow_name, message: `${cowLabel} calving in ${daysToCalving} days`, detail: `Expected: ${expectedCalving.toLocaleDateString()}` });
          if (farmer.phone) await sendSMS(farmer.phone, msg);
        }

        // Calving overdue
        if (daysToCalving < 0) {
          const msg = `🚨 DAIRY FARM URGENT: ${cowLabel} is overdue for calving by ${Math.abs(daysToCalving)} days! Call the vet immediately.`;
          notifications.push({ type: 'calving_overdue', priority: 'urgent', cow_id: record.cow_id, cow_code: record.cow_code, cow_name: record.cow_name, message: `${cowLabel} is overdue for calving!`, detail: `Expected ${Math.abs(daysToCalving)} days ago.` });
          if (farmer.phone) await sendSMS(farmer.phone, msg);
        }
      }

      // After successful calving — next heat
      if (record.outcome === 'Successful' && record.calving_date) {
        const calvingDate = new Date(record.calving_date);
        const nextHeat = new Date(calvingDate);
        nextHeat.setDate(nextHeat.getDate() + 45);
        const daysToHeat = Math.ceil((nextHeat - today) / (1000 * 60 * 60 * 24));

        if (daysToHeat >= 0 && daysToHeat <= 3) {
          const msg = `🌡️ DAIRY FARM ALERT: ${cowLabel} expected on heat in ${daysToHeat} days. Next heat: ${nextHeat.toLocaleDateString()}.`;
          notifications.push({ type: 'heat_after_calving', priority: 'high', cow_id: record.cow_id, cow_code: record.cow_code, cow_name: record.cow_name, message: `${cowLabel} on heat in ${daysToHeat} days`, detail: `Next heat: ${nextHeat.toLocaleDateString()}` });
          if (farmer.phone) await sendSMS(farmer.phone, msg);
        }

        if (daysToHeat < 0 && daysToHeat >= -2) {
          const msg = `🌡️ DAIRY FARM ALERT: ${cowLabel} is on heat NOW! Time to inseminate.`;
          notifications.push({ type: 'heat_now', priority: 'urgent', cow_id: record.cow_id, cow_code: record.cow_code, cow_name: record.cow_name, message: `${cowLabel} is on heat now!`, detail: `Expected heat date was ${nextHeat.toLocaleDateString()}.` });
          if (farmer.phone) await sendSMS(farmer.phone, msg);
        }
      }
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;