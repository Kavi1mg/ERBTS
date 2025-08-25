const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --------------------
// MySQL Connection
// --------------------
let db;
(async () => {
  try {
    db = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Narmada*09',
      database: 'erbts',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('✅ Connected to database.');
  } catch (err) {
    console.error('❌ DB connection failed:', err.stack);
  }
})();

// --------------------
// Routes
// --------------------
app.post('/register', async (req, res) => {
  const {
    hospital_id,
    password,
    name,
    address,
    pincode,
    phone,
    email,
    district,
    state
  } = req.body;

  try {
    const loginQuery = 'INSERT INTO login (role, hospitalId, password) VALUES ("hospital", ?, ?)';
    await db.query(loginQuery, [hospital_id, password]);

    const hospitalQuery = `
      INSERT INTO hospital (hospitalId, name, address, pincode, email, phone_number, district, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(hospitalQuery, [hospital_id, name, address, pincode, email, phone, district, state]);

    res.status(200).json({ message: 'Hospital registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error creating hospital' });
  }
});

app.post('/api/login', async (req, res) => {
  const { role, hospitalId, password } = req.body;

  try {
    const [results] = await db.query(
      'SELECT * FROM login WHERE role = ? AND hospitalId = ? AND password = ?',
      [role, hospitalId, password]
    );

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        hospitalId: results[0].hospitalId,
        role: results[0].role
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});