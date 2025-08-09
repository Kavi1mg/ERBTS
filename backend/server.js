const express = require('express');
const mysql = require('mysql2');
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


app.post('/register', (req, res) => {
  const {
    hospital_id,
    password,
    name,
    address,
    pincode,
    phone, // coming from frontend
    email,
    district,
    state
  } = req.body;

  // Insert into login
  const loginQuery = 'INSERT INTO login ( role,hospitalId, password) VALUES ("hospital",?, ?)';
  db.query(loginQuery, [hospital_id, password], (err) => {
    if (err) {
      console.error('Login insert error:', err);
      return res.status(500).json({ message: 'Error creating login' });
    }
    const hospitalQuery = `
      INSERT INTO hospital (hospitalId, name, address, pincode, email, phone_number,district,state)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(hospitalQuery, [hospital_id, name, address, pincode, email, phone,district,state], (err) => {
      if (err) {
        console.error('Hospital insert error:', err);
        return res.status(500).json({ message: 'Error creating hospital' });
      }
      res.status(200).json({ message: 'Hospital registered successfully' });
    });
  });
});


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

app.get('/api/resources/:hospitalId', async (req,res)=>{
  const { hospitalId } = req.params;
  const [rows] = await pool.query(
    'SELECT type, available AS quantity FROM available_resources WHERE hospitalId = ?',
    [hospitalId]
  );
  res.json(rows);
});

/* GET borrow requests (incoming to hospital) */
app.get('/api/borrow/:hospitalId', async (req,res)=>{
  const { hospitalId } = req.params;
  const [rows] = await pool.query(
    `SELECT id, fromHospitalId AS fromHospital, resourceType AS type, quantity, reason, status 
     FROM borrow_requests WHERE toHospitalId = ? ORDER BY requestedAt DESC`,
    [hospitalId]
  );
  res.json(rows);
});

/* POST create borrow request */
app.post('/api/borrow/request', async (req,res)=>{
  const { fromHospitalId, resourceType, quantity, reason } = req.body;
  // simple auto-match: pick a donor with available >= qty (exclude requester)
  const [donors] = await pool.query(
    `SELECT hospitalId FROM available_resources WHERE type=? AND available >= ? AND hospitalId != ? ORDER BY available DESC LIMIT 1`,
    [resourceType, quantity, fromHospitalId]
  );
  const toHospitalId = donors.length ? donors[0].hospitalId : 'A001';
  const [result] = await pool.query(
    'INSERT INTO borrow_requests (fromHospitalId, toHospitalId, resourceType, quantity, reason) VALUES (?,?,?,?,?)',
    [fromHospitalId, toHospitalId, resourceType, quantity, reason]
  );
  res.json({ status: 'ok', requestId: result.insertId, toHospitalId });
});

/* POST accept borrow request */
app.post('/api/borrow/accept/:id', async (req,res)=>{
  const requestId = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[reqRow]] = await conn.query('SELECT * FROM borrow_requests WHERE id = ?', [requestId]);
    if(!reqRow) throw new Error('Request not found');

    // update status
    await conn.query('UPDATE borrow_requests SET status = "approved" WHERE id = ?', [requestId]);

    // create transfer
    await conn.query('INSERT INTO transfers (requestId, fromHospitalId, toHospitalId, resourceType, quantity) VALUES (?,?,?,?,?)',
      [requestId, reqRow.fromHospitalId, reqRow.toHospitalId, reqRow.resourceType, reqRow.quantity]);

    // decrement donor available (fromHospitalId) and increment receiver
    await conn.query('UPDATE available_resources SET available = available - ? WHERE hospitalId = ? AND type = ?',
      [reqRow.quantity, reqRow.fromHospitalId, reqRow.resourceType]);

    // ensure receiver row exists - if not, insert
    const [recv] = await conn.query('SELECT * FROM available_resources WHERE hospitalId = ? AND type = ?',
      [reqRow.toHospitalId, reqRow.resourceType]);
    if(recv.length) {
      await conn.query('UPDATE available_resources SET available = available + ? WHERE hospitalId = ? AND type = ?',
        [reqRow.quantity, reqRow.toHospitalId, reqRow.resourceType]);
    } else {
      await conn.query('INSERT INTO available_resources (hospitalId, type, available) VALUES (?,?,?)',
        [reqRow.toHospitalId, reqRow.resourceType, reqRow.quantity]);
    }
    await conn.commit();
    res.json({status:'ok'});
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

/* POST reject borrow request */
app.post('/api/borrow/reject/:id', async (req,res)=>{
  const requestId = req.params.id;
  await pool.query('UPDATE borrow_requests SET status = "rejected" WHERE id = ?', [requestId]);
  res.json({status:'ok'});
});

/* GET predictions: backend will forward to ML microservice (later) */
app.get('/api/predictions/:hospitalId', async (req,res)=>{
  // For now return placeholder or integrate ML after step 6
  const { hospitalId } = req.params;
  // simple static placeholder:
  res.json([{ type:'Oxygen Cylinders', predicted_quantity: 3 }, { type:'Ventilators', predicted_quantity:1 }]);
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
