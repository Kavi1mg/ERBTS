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

app.get('/api/resources/:hospitalId', async (req, res) => {
  const { hospitalId } = req.params;
  const [rows] = await db.query(
    'SELECT type, available AS quantity FROM available_resources WHERE hospitalId = ?',
    [hospitalId]
  );
  res.json(rows);
});

app.get('/api/borrow/:hospitalId', async (req, res) => {
  const { hospitalId } = req.params;
  const [rows] = await db.query(
    `SELECT id, fromHospitalId AS fromHospital, resourceType AS type, quantity, reason, status 
     FROM borrow_requests WHERE toHospitalId = ? ORDER BY requestedAt DESC`,
    [hospitalId]
  );
  res.json(rows);
});

app.post('/api/borrow/request', async (req, res) => {
  const { fromHospitalId, resourceType, quantity, reason } = req.body;
  const [donors] = await db.query(
    `SELECT hospitalId FROM available_resources WHERE type=? AND available >= ? AND hospitalId != ? ORDER BY available DESC LIMIT 1`,
    [resourceType, quantity, fromHospitalId]
  );
  const toHospitalId = donors.length ? donors[0].hospitalId : 'A001';
  const [result] = await db.query(
    'INSERT INTO borrow_requests (fromHospitalId, toHospitalId, resourceType, quantity, reason) VALUES (?,?,?,?,?)',
    [fromHospitalId, toHospitalId, resourceType, quantity, reason]
  );
  res.json({ status: 'ok', requestId: result.insertId, toHospitalId });
});

app.post('/api/borrow/accept/:id', async (req, res) => {
  const requestId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[reqRow]] = await conn.query('SELECT * FROM borrow_requests WHERE id = ?', [requestId]);
    if (!reqRow) throw new Error('Request not found');

    await conn.query('UPDATE borrow_requests SET status = "approved" WHERE id = ?', [requestId]);

    await conn.query(
      'INSERT INTO transfers (requestId, fromHospitalId, toHospitalId, resourceType, quantity) VALUES (?,?,?,?,?)',
      [requestId, reqRow.fromHospitalId, reqRow.toHospitalId, reqRow.resourceType, reqRow.quantity]
    );

    await conn.query(
      'UPDATE available_resources SET available = available - ? WHERE hospitalId = ? AND type = ?',
      [reqRow.quantity, reqRow.fromHospitalId, reqRow.resourceType]
    );

    const [recv] = await conn.query(
      'SELECT * FROM available_resources WHERE hospitalId = ? AND type = ?',
      [reqRow.toHospitalId, reqRow.resourceType]
    );
    if (recv.length) {
      await conn.query(
        'UPDATE available_resources SET available = available + ? WHERE hospitalId = ? AND type = ?',
        [reqRow.quantity, reqRow.toHospitalId, reqRow.resourceType]
      );
    } else {
      await conn.query(
        'INSERT INTO available_resources (hospitalId, type, available) VALUES (?,?,?)',
        [reqRow.toHospitalId, reqRow.resourceType, reqRow.quantity]
      );
    }
    await conn.commit();
    res.json({ status: 'ok' });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

app.post('/api/borrow/reject/:id', async (req, res) => {
  const requestId = req.params.id;
  await db.query('UPDATE borrow_requests SET status = "rejected" WHERE id = ?', [requestId]);
  res.json({ status: 'ok' });
});

app.get('/api/predictions/:hospitalId', async (req, res) => {
  const { hospitalId } = req.params;
  res.json([
    { type: 'Oxygen Cylinders', predicted_quantity: 3 },
    { type: 'Ventilators', predicted_quantity: 1 }
  ]);
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
