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
  password: 'Narmada*09',
  database: 'erbts'
  
});

const dbPromise = db.promise();
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


app.post("/register", (req, res) => {
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

  // First insert into login (since hospitalId is FK)
  const loginQuery = "INSERT INTO login (hospitalId, password) VALUES (?, ?)";
  db.query(loginQuery, [hospital_id, password], (err, result) => {
    if (err) {
      console.error("Error inserting into login:", err);
      return res.status(500).json({ error: "Failed to register hospital (login)" });
    }

    // Then insert into hospital
    const hospitalQuery = `
      INSERT INTO hospital
      (hospitalId, name, address, pincode, email, phone_number, district, state, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      hospitalQuery,
      [hospital_id, name, address, pincode, email, phone, district, state, password],
      (err2, result2) => {
        if (err2) {
          console.error("Error inserting into hospital:", err2);
          return res.status(500).json({ error: "Failed to register hospital (hospital)" });
        }
        res.json({ message: "Hospital registered successfully!" });
      }
    );
  });
});
// ===================== HOSPITAL PROFILE API =====================

// Middleware to simulate logged-in hospital (for demo)
// In production, replace with real auth (JWT/session)
const getLoggedHospitalId = (req) => {
  // You can replace this with req.user.hospitalId after authentication
  return req.query.hospitalId || 'DL_AIIMS'; // default for testing
};

// GET hospital profile
app.get('/profile', (req, res) => {
  const hospitalId = getLoggedHospitalId(req);

  const query = `
    SELECT hospitalId, name, address, pincode, email, phone_number AS phone, district, state 
    FROM hospital 
    WHERE hospitalId = ?
  `;
  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching hospital profile:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(results[0]);
  });
});

// UPDATE hospital profile
app.put('/profile', (req, res) => {
  const hospitalId = getLoggedHospitalId(req);
  const { name, address, pincode, email, phone, district, state } = req.body;

  const query = `
    UPDATE hospital
    SET name = ?, address = ?, pincode = ?, email = ?, phone_number = ?, district = ?, state = ?
    WHERE hospitalId = ?
  `;
  db.query(
    query,
    [name, address, pincode, email, phone, district, state, hospitalId],
    (err, result) => {
      if (err) {
        console.error('Error updating hospital profile:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Hospital not found' });
      }
      res.json({ success: true, message: 'Profile updated successfully' });
    }
  );
});

//===== nearbyhospital based resource ====//
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// API: get hospitals with available resource nearby
// app.get("/api/hospitals", async (req, res) => {
//   try {
//     const { resourceType, minQuantity = 1, hospitalId } = req.query;
//     if (!resourceType || !hospitalId)
//       return res.status(400).json({ error: "Missing parameters" });

//     // Get current hospital location
//     const [currentHospital] = await dbPromise.query(
//       "SELECT latitude, longitude FROM hospital_location WHERE hospitalId = ?",
//       [hospitalId]
//     );

//     if (currentHospital.length === 0)
//       return res.status(404).json({ error: "Hospital not found" });

//     const { latitude, longitude } = currentHospital[0];

//     // Get all hospitals with the required resource and quantity
//     const [hospitals] = await dbPromise.query(
//       `SELECT hr.hospitalId, h.name, h.address, h.phone_number AS phone, hr.available AS quantity, hl.latitude, hl.longitude
//        FROM available_resources hr
//        JOIN hospital h ON hr.hospitalId = h.hospitalId
//        JOIN hospital_location hl ON hr.hospitalId = hl.hospitalId
//        WHERE hr.resource_type = ? AND hr.available >= ? AND hr.hospitalId != ?`,
//       [resourceType, minQuantity, hospitalId]
//     );

//     // Sort by nearest distance
//     const hospitalsWithDistance = hospitals.map((h) => ({
//       ...h,
//       distance: getDistance(latitude, longitude, h.latitude, h.longitude),
//     }));

//     hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

//     res.json(hospitalsWithDistance);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ============== resource adding ======
app.post('/api/resources/:hospitalId', (req, res) => {
  const hospitalId = req.params.hospitalId;
  const { resource_type, quantity } = req.body;

  if (!resource_type || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const selectQuery = `
    SELECT * FROM available_resources 
    WHERE hospitalId = ? AND resource_type = ?;
  `;

  db.query(selectQuery, [hospitalId, resource_type], (err, results) => {
    if (err) {
      console.error('Error checking resource:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const resource = results[0];

      // Convert to numbers before adding
      const newTotal = Number(resource.total_quantity) + Number(quantity);
      const newAvailable = Number(resource.available) + Number(quantity);

      const updateQuery = `
        UPDATE available_resources 
        SET total_quantity = ?, available = ? 
        WHERE id = ?;
      `;

      db.query(updateQuery, [newTotal, newAvailable, resource.id], (err2) => {
        if (err2) {
          console.error('Error updating resource:', err2);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Resource updated successfully' });
      });

    } else {
      const insertQuery = `
        INSERT INTO available_resources (hospitalId, resource_type, total_quantity, available)
        VALUES (?, ?, ?, ?);
      `;

      db.query(insertQuery, [hospitalId, resource_type, quantity, quantity], (err3) => {
        if (err3) {
          console.error('Error inserting resource:', err3);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Resource added successfully' });
      });
    }
  });
});



app.get("/api/hospitals", async (req, res) => {
  try {
    const { hospitalId, resourceType, minQuantity = 1 } = req.query;

    if (!hospitalId || !resourceType) {
      return res.status(400).json({ error: "Missing hospitalId or resourceType" });
    }

    // 1️⃣ Get current hospital location
    const [currentHospital] = await dbPromise.query(
      "SELECT latitude, longitude FROM hospital_location WHERE hospitalId = ?",
      [hospitalId]
    );

    if (!currentHospital || currentHospital.length === 0)
      return res.status(404).json({ error: "Hospital not found" });

    const { latitude, longitude } = currentHospital[0];

    // 2️⃣ Get all hospitals with the required resource except the current hospital
    const [hospitals] = await dbPromise.query(
      `SELECT hr.hospitalId, h.name, h.address, h.phone_number AS phone,
              hr.available AS quantity, hl.latitude, hl.longitude
       FROM available_resources hr
       JOIN hospital h ON hr.hospitalId = h.hospitalId
       JOIN hospital_location hl ON hr.hospitalId = hl.hospitalId
       WHERE hr.resource_type = ? AND hr.available >= ? AND hr.hospitalId != ?`,
      [resourceType, minQuantity, hospitalId]
    );

    // 3️⃣ Compute distance for each hospital
    const hospitalsWithDistance = hospitals.map((h) => ({
      ...h,
      distance: getDistance(latitude, longitude, h.latitude, h.longitude),
    }));

    // 4️⃣ Separate nearby hospitals (distance <= 10km) and others
    const nearby = hospitalsWithDistance
      .filter(h => h.distance <= 10)
      .sort((a, b) => a.distance - b.distance); // closest first

    const remaining = hospitalsWithDistance
      .filter(h => h.distance > 10)
      .sort((a, b) => a.distance - b.distance); // farther first

    // 5️⃣ Return combined result: nearby first, then remaining
    res.json([...nearby, ...remaining]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
// app.put('/api/borrow_requests/:id/approve', (req, res) => {
//   const requestId = req.params.id;
//   const { due_date } = req.body;

//   const updateQuery = `
//     UPDATE borrow_requests 
//     SET status = 'approved', due_date = ? 
//     WHERE id = ?;
//   `;

//   db.query(updateQuery, [due_date, requestId], (err, result) => {
//     if (err) {
//       console.error('Error approving request:', err);
//       return res.status(500).json({ error: 'Database error' });
//     }

//     // Insert into transfers table
//     const insertTransfer = `
//       INSERT INTO transfers (requestId, fromHospitalId, toHospitalId, resourceType, quantity, status)
//       SELECT id, fromHospitalId, toHospitalId, resourceType, quantity, 'initiated'
//       FROM borrow_requests WHERE id = ?;
//     `;
//     db.query(insertTransfer, [requestId], (err2) => {
//       if (err2) {
//         console.error('Error inserting transfer:', err2);
//         return res.status(500).json({ error: 'Database error' });
//       }
//       res.json({ success: true, message: 'Request approved and transfer created' });
//     });
//   });
// });

// ------------------ Approve Borrow Request ------------------
app.put("/api/borrow_requests/:id/approve", (req, res) => {
  const requestId = req.params.id;

  // 1. Get borrow request details
  db.query(
    "SELECT * FROM borrow_requests WHERE id = ? AND status='pending'",
    [requestId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0)
        return res.status(400).json({ message: "Request not found or already processed" });

      const { toHospitalId, resourceType, quantity } = result[0];

      // 2. Reduce available quantity from lender hospital
      db.query(
        "UPDATE available_resources SET available = available - ? WHERE hospitalId = ? AND resource_type = ? AND available >= ?",
        [quantity, toHospitalId, resourceType, quantity],
        (err2, result2) => {
          if (err2) return res.status(500).json({ error: err2 });
          if (result2.affectedRows === 0)
            return res.status(400).json({ message: "Not enough resources to approve" });

          // 3. Mark borrow request as approved
          db.query(
            "UPDATE borrow_requests SET status='approved', updatedAt=NOW() WHERE id=?",
            [requestId],
            (err3) => {
              if (err3) return res.status(500).json({ error: err3 });

              // 4. Insert into transfers table
              db.query(
                "INSERT INTO transfers (requestId, fromHospitalId, toHospitalId, resourceType, quantity, status) VALUES (?, ?, ?, ?, ?, 'initiated')",
                [requestId, result[0].fromHospitalId, toHospitalId, resourceType, quantity],
                (err4) => {
                  if (err4) return res.status(500).json({ error: err4 });
                  return res.json({ message: "Borrow request approved successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
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
// app.put('/api/borrow_requests/:id/return', (req, res) => {
//   const requestId = req.params.id;
//   const query = `
//     UPDATE borrow_requests 
//     SET return_status = 'returned', returned_at = NOW(), updatedAt = NOW()
//     WHERE id = ?;
//   `;
//   db.query(query, [requestId], (err, result) => {
//     if (err) {
//       console.error('Error updating return status:', err);
//       return res.status(500).json({ error: 'Database error' });
//     }
//     res.json({ success: true, message: 'Request marked as returned' });
//   });
// });

// ------------------ Return Borrowed Resource ------------------
app.put("/api/borrow_requests/:id/return", (req, res) => {
  const requestId = req.params.id;

  // 1. Get borrow request details
  db.query(
    "SELECT * FROM borrow_requests WHERE id = ? AND status='approved' AND return_status='not_returned'",
    [requestId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0)
        return res.status(400).json({ message: "Request not found or already returned" });

      const { toHospitalId, fromHospitalId, resourceType, quantity } = result[0];

      // 2. Add back resources to lender hospital
      db.query(
        "UPDATE available_resources SET available = available + ? WHERE hospitalId = ? AND resource_type = ?",
        [quantity, toHospitalId, resourceType],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2 });

          // 3. Mark borrow request as returned
          db.query(
            "UPDATE borrow_requests SET return_status='returned', returned_at=NOW(), updatedAt=NOW() WHERE id=?",
            [requestId],
            (err3) => {
              if (err3) return res.status(500).json({ error: err3 });

              // 4. Update transfer table
              db.query(
                "UPDATE transfers SET is_return=1, return_completed_at=NOW(), status='completed' WHERE requestId=?",
                [requestId],
                (err4) => {
                  if (err4) return res.status(500).json({ error: err4 });
                  return res.json({ message: "Resource returned successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
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

app.get('/api/resources/:hospitalId', (req, res) => {
  const hospitalId = req.params.hospitalId;

  const query = `
    SELECT 
      TRIM(LOWER(resource_type)) AS resource_type,
      SUM(total_quantity) AS total_quantity,
      SUM(available) AS available
    FROM available_resources
    WHERE hospitalId = ?
    GROUP BY TRIM(LOWER(resource_type));
  `;

  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching resources:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


// app.get("/api/resources/:hospitalId", (req, res) => {
//   const { hospitalId } = req.params;
//   const sql = "SELECT * FROM available_resources WHERE hospitalId = ?";
//   db.query(sql, [hospitalId], (err, results) => {
//     if (err) {
//       console.error("Error fetching resources:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(results);
//   });
// });

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

app.get('/api/resources', (req, res) => {
  const query = "SELECT DISTINCT resource_type AS resourceType FROM available_resources";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching resource types:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const resourceTypes = results.map(row => row.resourceType);
    res.json(resourceTypes);
  });
});





app.get('/api/hospitals', (req, res) => {
  const { resourceType, minQuantity } = req.query;

  if (!resourceType || !minQuantity) {
    return res.status(400).json({ error: 'Missing resourceType or minQuantity query parameters' });
  }

  const query = `
    SELECT h.hospitalId, h.name, h.address, h.phone_number AS phone,ar.available AS quantity FROM hospital h
    JOIN available_resources ar ON h.hospitalId = ar.hospitalId
    WHERE ar.resource_type = ? AND ar.available >= ?;
  `;

  db.query(query, [resourceType, Number(minQuantity)], (err, results) => {
    if (err) {
      console.error('Error fetching hospitals by resource:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});





const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
