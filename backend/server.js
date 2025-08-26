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
      password: 'KAVI@123mg',
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




// Get hospitals that have a specific resource available
// app.get("/api/hospitals/available/:resourceType", async (req, res) => {
//   const { resourceType } = req.params;
//   try {
//     const [rows] = await pool.query(
//       `SELECT h.hospital_id, h.name 
//        FROM hospitals h
//        JOIN available_resources r ON h.hospitalId = r.hospitalId
//        WHERE r.type = ? AND r.available > 0`,
//       [resourceType]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch hospitals" });
//   }
// });

app.get("/api/hospitals", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM hospital");
    console.log("Database query results:", results);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});


// This assumes you're using express-session or JWT for authentication
app.get("/api/auth/me", async (req, res) => {
  try {
    // If using session-based authentication
    if (!req.session || !req.session.hospitalId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [rows] = await db.query(
      "SELECT hospitalId, name, email FROM hospitals WHERE hospitalId = ?",
      [req.session.hospitalId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching hospital:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
