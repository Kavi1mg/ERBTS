const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'KAVI@123mg',
  database: 'erbts'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// ===================== LOGIN API (Already Yours) =====================
app.post('/api/login', (req, res) => {
  const { role, hospitalId, password } = req.body;

  if (!role || !hospitalId || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  if (role === 'hospital') {
    const query = 'SELECT hospitalId, password FROM hospital WHERE hospitalId = ? AND password = ?';
    db.query(query, [hospitalId, password], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      if (results.length === 1) {
        return res.json({ success: true, hospitalId, role });
      } else {
        return res.json({ success: false, message: 'Invalid credentials' });
      }
    });
  } else if (role === 'admin') {
    const query = 'SELECT hospitalId, password FROM login WHERE hospitalId = ? AND password = ? AND role = ?';
    db.query(query, [hospitalId, password, 'admin'], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      if (results.length === 1) {
        return res.json({ success: true, hospitalId, role });
      } else {
        return res.json({ success: false, message: 'Invalid credentials' });
      }
    });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
});

// ===================== HOSPITAL API (Already Yours) =====================
app.get('/api/hospital/:hospitalId', (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query = 'SELECT hospitalId, name, address, pincode, email, phone_number, district, state FROM hospital WHERE hospitalId = ?';
  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching hospital:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(results[0]);
  });
});

// ===================== INCOMING REQUESTS API =====================
// Get all incoming requests for a hospital
app.get('/api/incoming_requests/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;
  const query = `
    SELECT 
      br.id AS request_id,
      h.name AS hospital_name,
      br.resourceType AS resource_type,
      br.quantity,
      br.urgency_level,
      br.status,
      br.requestedAt AS requested_at,
      br.updatedAt AS updated_at,
      br.due_date,
      br.returned_at,
      br.return_status
    FROM borrow_requests br
    JOIN hospital h ON br.fromHospitalId = h.hospitalId
    WHERE br.toHospitalId = ?;
  `;
  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Approve a request
app.put('/api/borrow_requests/:id/approve', (req, res) => {
  const requestId = req.params.id;
  const { due_date } = req.body;

  const updateQuery = `
    UPDATE borrow_requests 
    SET status = 'approved', due_date = ? 
    WHERE id = ?;
  `;

  db.query(updateQuery, [due_date, requestId], (err, result) => {
    if (err) {
      console.error('Error approving request:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Insert into transfers table
    const insertTransfer = `
      INSERT INTO transfers (requestId, fromHospitalId, toHospitalId, resourceType, quantity, status)
      SELECT id, fromHospitalId, toHospitalId, resourceType, quantity, 'initiated'
      FROM borrow_requests WHERE id = ?;
    `;
    db.query(insertTransfer, [requestId], (err2) => {
      if (err2) {
        console.error('Error inserting transfer:', err2);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Request approved and transfer created' });
    });
  });
});

// Reject a request
app.put('/api/borrow_requests/:id/reject', (req, res) => {
  const requestId = req.params.id;
  const query = `
    UPDATE borrow_requests 
    SET status = 'rejected' 
    WHERE id = ?;
  `;
  db.query(query, [requestId], (err, result) => {
    if (err) {
      console.error('Error rejecting request:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, message: 'Request rejected' });
  });
});


// ===================== BORROW REQUESTS API =====================

// Get all borrow requests made by a hospital
app.get('/api/borrow_requests/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;
  const query = `
    SELECT 
      br.id,
      h.name AS toHospitalName,
      br.resourceType,
      br.quantity,
      br.urgency_level,
      br.status,
      br.requestedAt,
      br.updatedAt,
      br.due_date,
      br.returned_at,
      br.return_status
    FROM borrow_requests br
    JOIN hospital h ON br.toHospitalId = h.hospitalId
    WHERE br.fromHospitalId = ?
    ORDER BY br.requestedAt DESC;
  `;
  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching borrow requests:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Create a new borrow request
app.post('/api/borrow_requests', (req, res) => {
  const { fromHospitalId, toHospitalId, resourceType, quantity, urgency_level } = req.body;

  if (!fromHospitalId || !toHospitalId || !resourceType || !quantity || !urgency_level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO borrow_requests 
    (fromHospitalId, toHospitalId, resourceType, quantity, urgency_level, status, requestedAt, updatedAt, return_status)
    VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW(), 'not_returned');
  `;
  db.query(query, [fromHospitalId, toHospitalId, resourceType, quantity, urgency_level], (err, result) => {
    if (err) {
      console.error('Error creating borrow request:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, message: 'Borrow request created', id: result.insertId });
  });
});

// Mark a borrow request as returned
app.put('/api/borrow_requests/:id/return', (req, res) => {
  const requestId = req.params.id;
  const query = `
    UPDATE borrow_requests 
    SET return_status = 'returned', returned_at = NOW(), updatedAt = NOW()
    WHERE id = ?;
  `;
  db.query(query, [requestId], (err, result) => {
    if (err) {
      console.error('Error updating return status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, message: 'Request marked as returned' });
  });
});

// ================== HOSPITAL RESOURCES ==================

// Get all hospitals (id + name)
app.get("/hospitals", (req, res) => {
  const query = "SELECT hospitalId, name FROM hospital";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching hospitals:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // convert into { hospitalId: name } mapping for frontend
    const hospitalsMap = {};
    results.forEach(h => {
      hospitalsMap[h.hospitalId] = h.name;
    });

    res.json(hospitalsMap);
  });
});

// Get resources for a specific hospital
app.get("/api/resources/:hospitalId", (req, res) => {
  const { hospitalId } = req.params;
  const sql = "SELECT * FROM available_resources WHERE hospitalId = ?";
  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error("Error fetching resources:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get equipment condition for a specific hospital
app.get("/api/equipment/:hospitalId", (req, res) => {
  const { hospitalId } = req.params;
  const sql = "SELECT * FROM equipment_maintenance WHERE hospitalId = ?";
  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error("Error fetching equipment:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});





const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
