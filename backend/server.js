const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --------------------
// MySQL Connection
// --------------------
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'KAVI@123mg',
  database: 'erbts'
});

db.connect(err => {
  if (err) {
    console.error('❌ DB connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to database.');
});

// --------------------
// LOGIN
// --------------------
app.post('/api/login', (req, res) => {
  const { role, hospitalId, password } = req.body;

  const query = 'SELECT * FROM login WHERE role = ? AND hospitalId = ? AND password = ?';
  db.query(query, [role, hospitalId, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        hospitalId: results[0].hospitalId,
        role: results[0].role
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });
});

// --------------------
// GET CURRENT HOSPITAL RESOURCES
// --------------------
app.get('/api/resources/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;

  const query = 'SELECT type, available FROM available_resources WHERE hospitalId = ?';
  db.query(query, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    res.json(results);
  });
});

// --------------------
// GET NEARBY HOSPITALS (by geo)
// --------------------
app.get('/api/nearby/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;
  const radiusKm = 10;

  const getCoordsQuery = 'SELECT latitude, longitude FROM hospital_location WHERE hospitalId = ?';
  db.query(getCoordsQuery, [hospitalId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: 'Hospital not found' });

    const { latitude, longitude } = results[0];

    const nearbyQuery = `
      SELECT *, (
        6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )
      ) AS distance
      FROM hospital_location
      WHERE hospitalId != ?
      HAVING distance < ?
      ORDER BY distance ASC
    `;

    db.query(
      nearbyQuery,
      [latitude, longitude, latitude, hospitalId, radiusKm],
      (err, hospitals) => {
        if (err) return res.status(500).json({ error: 'Nearby search failed' });
        res.json({ nearbyHospitals: hospitals });
      }
    );
  });
});

// --------------------
// CREATE BORROW REQUEST
// --------------------
app.post('/api/request', (req, res) => {
  const { fromHospitalId, toHospitalId, resourceType, quantity } = req.body;

  const query = `
    INSERT INTO borrow_requests (fromHospitalId, toHospitalId, resourceType, quantity)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [fromHospitalId, toHospitalId, resourceType, quantity], err => {
    if (err) return res.status(500).json({ error: 'Failed to create request' });

    res.status(201).json({ message: 'Request sent successfully' });
  });
});

// --------------------
// RESPOND TO REQUEST (Accept/Reject)
// --------------------
app.post('/api/request/:requestId/respond', (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  const query = 'UPDATE borrow_requests SET status = ? WHERE requestId = ?';
  db.query(query, [status, requestId], err => {
    if (err) return res.status(500).json({ error: 'Failed to update status' });

    res.json({ message: 'Request updated' });
  });
});

// --------------------
// START SERVER
// --------------------
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
