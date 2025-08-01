const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --------------------------------
// MySQL Database Connection
// --------------------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "KAVI@123mg",
  database: "erbts"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");
});

// --------------------------------
// Login Route
// --------------------------------
app.post('/api/login', (req, res) => {
  const { role, hospitalId, password } = req.body;
  console.log("Login request body:", req.body);

  const query = 'SELECT * FROM login WHERE role = ? AND hospitalId = ? AND password = ?';
  db.query(query, [role, hospitalId, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

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

// --------------------------------
// Get Resources of a Hospital
// --------------------------------
app.get('/api/resources/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;

  const query = 'SELECT type, available FROM available_resources WHERE hospitalId = ?';
  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching resources:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json(results);
  });
});

// --------------------------------
// Get Nearby Hospitals Based on Latitude/Longitude
// --------------------------------
app.get('/api/nearby/:hospitalId', (req, res) => {
  const hospitalId = req.params.hospitalId;
  const radiusKm = 10; // Distance limit

  const getHospitalQuery = `
    SELECT latitude, longitude FROM hospital_location WHERE hospitalId = ?
  `;

  db.query(getHospitalQuery, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Hospital not found' });

    const { latitude, longitude } = results[0];

    // Haversine formula to find nearby hospitals
    const nearbyQuery = `
      SELECT *, (
        6371 * acos(
          cos(radians(?)) *
          cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) *
          sin(radians(latitude))
        )
      ) AS distance
      FROM hospital_location
      WHERE hospitalId != ?
      HAVING distance < ?
      ORDER BY distance ASC
    `;

    db.query(nearbyQuery, [latitude, longitude, latitude, hospitalId, radiusKm], (err, nearby) => {
      if (err) return res.status(500).json({ error: err });

      res.json({ nearbyHospitals: nearby });
    });
  });
});


app.post('/api/request', (req, res) => {
  const { fromHospitalId, toHospitalId, resourceType, quantity } = req.body;

  const query = `
    INSERT INTO borrow_requests (fromHospitalId, toHospitalId, resourceType, quantity)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [fromHospitalId, toHospitalId, resourceType, quantity], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create request' });

    res.status(201).json({ message: 'Request sent successfully' });
  });
});



app.post('/api/request/:requestId/respond', (req, res) => {
  const { status } = req.body;
  const { requestId } = req.params;

  const query = `UPDATE borrow_requests SET status = ? WHERE requestId = ?`;
  db.query(query, [status, requestId], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update status' });
    res.json({ message: 'Request updated' });
  });
});


// --------------------------------
// Start Server
// --------------------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
