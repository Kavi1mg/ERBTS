// backend/routes/hospital.js
router.get('/resources/:hospitalId', async (req, res) => {
  const { hospitalId } = req.params;
  try {
    const resources = await db.query('SELECT * FROM resources WHERE hospital_id = ?', [hospitalId]);
    res.json(resources[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});
