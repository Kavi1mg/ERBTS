const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path to your db connection file

// GET current resources for the logged-in hospital
router.get('/current', (req, res) => {
  const userId = req.headers['userid']; // send this from frontend
  if (!userId) {
    return res.status(400).json({ error: 'Hospital ID required' });
  }

  const sql = `
    SELECT type, available AS quantity
    FROM available_resources
    WHERE hospitalId = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Failed to fetch resources' });
    }
    res.json(results);
  });
});

module.exports = router;
