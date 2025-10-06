 
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection config
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'KAVI@123mg',
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

// if using Node.js 18+, fetch is built-in

// Function to get lat/lng from an address
// async function geocodeAddress(address) {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
//     );
//     const data = await response.json();
//     if (data[0]) {
//       return {
//         lat: parseFloat(data[0].lat),
//         lng: parseFloat(data[0].lon),
//       };
//     }
//     return null; // address not found
//   } catch (err) {
//     console.error("Geocoding error:", err);
//     return null;
//   }
// }

// app.get('/api/nearby-hospitals-map/:hospitalId', async (req, res) => {
//   const { hospitalId } = req.params;

//   // 1. Get current hospital
//   db.query(
//     "SELECT hospitalId, name, address, contact, email FROM hospital WHERE hospitalId = ?",
//     [hospitalId],
//     async (err, result) => {
//       if (err) return res.status(500).json(err);
//       if (result.length === 0) return res.status(404).json({ message: "Hospital not found" });

//       const currentHospital = result[0];

//       // 2. Fetch nearby hospitals in same district
//       db.query(
//         "SELECT hospitalId, name, address, contact, email FROM hospital WHERE district = ? AND hospitalId != ?",
//         [currentHospital.district, hospitalId],
//         async (err2, nearbyHospitals) => {
//           if (err2) return res.status(500).json(err2);

//           // 3. Geocode all hospitals
//           const geocodedCurrent = await geocodeAddress(currentHospital.address);
//           const geocodedNearby = await Promise.all(
//             nearbyHospitals.map(async (h) => {
//               const coords = await geocodeAddress(h.address);
//               return { ...h, ...coords };
//             })
//           );

//           res.json({
//             currentHospital: { ...currentHospital, ...geocodedCurrent },
//             nearbyHospitals: geocodedNearby
//           });
//         }
//       );
//     }
//   );
// });

// Utility to format date/time as "YYYY-MM-DD HH:mm:ss"
function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Utility function to calculate distance (km)
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

// Middleware placeholder for logged-in hospital simulation
const getLoggedHospitalId = (req) => {
  return req.query.hospitalId; // default for testing
};
// LOGIN API
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


// REGISTER HOSPITAL
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

  const loginQuery = "INSERT INTO login (hospitalId, password) VALUES (?, ?)";
  db.query(loginQuery, [hospital_id, password], (err) => {
    if (err) {
      console.error("Error inserting into login:", err);
      return res.status(500).json({ error: "Failed to register hospital (login)" });
    }

    const hospitalQuery = `
      INSERT INTO hospital
      (hospitalId, name, address, pincode, email, phone_number, district, state, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(hospitalQuery, [hospital_id, name, address, pincode, email, phone, district, state, password], (err2) => {
      if (err2) {
        console.error("Error inserting into hospital:", err2);
        return res.status(500).json({ error: "Failed to register hospital (hospital)" });
      }
      res.json({ message: "Hospital registered successfully!" });
    });
  });
});



// RESOURCE MANAGEMENT

// Add or update resources
app.post('/api/resources/:hospitalId', (req, res) => {
  const hospitalId = req.params.hospitalId;
  const { resource_type, quantity } = req.body;

  if (!resource_type || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const selectQuery = `SELECT * FROM available_resources WHERE hospitalId = ? AND resource_type = ?;`;

  db.query(selectQuery, [hospitalId, resource_type], (err, results) => {
    if (err) {
      console.error('Error checking resource:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const resource = results[0];
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

// Get resources for a hospital (aggregated)
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

// Get distinct resource types
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

// HOSPITALS API

// List all hospitals (id + name)
app.get("/hospitals", (req, res) => {
  const query = "SELECT hospitalId, name FROM hospital";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching hospitals:", err);
      return res.status(500).json({ error: "Database error" });
    }
    const hospitalsMap = {};
    results.forEach(h => {
      hospitalsMap[h.hospitalId] = h.name;
    });
    res.json(hospitalsMap);
  });
});

// Get hospital details by ID
app.get('/api/hospital/:hospitalId', (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query = `SELECT hospitalId, name, address, pincode, email, phone_number, district, state 
                 FROM hospital WHERE hospitalId = ?`;
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

// Get hospitals filtered by resource availability (simple version)
app.get('/api/hospitals', (req, res) => {
  const { resourceType, minQuantity } = req.query;
  if (!resourceType || !minQuantity) {
    return res.status(400).json({ error: 'Missing resourceType or minQuantity query parameters' });
  }

  const query = `
    SELECT h.hospitalId, h.name, h.address, h.phone_number AS phone, ar.available AS quantity 
    FROM hospital h
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



app.get('/api/nearby-hospitals-map/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;

  // 1. Get current hospital
  db.query(
    "SELECT hospitalId, name, district, address, phone_number,email FROM hospital WHERE hospitalId = ?",
    [hospitalId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) return res.status(404).json({ message: "Hospital not found" });

      const currentHospital = result[0];
      const district = currentHospital.district;

      // 2. Choose default map center for each district (hardcoded for simplicity)
      // 👉 you can expand this dictionary for your districts
      const districtCenters = {
        "Chennai": { lat: 13.0827, lng: 80.2707 },
        "Madurai": { lat: 9.9252, lng: 78.1198 },
        "Coimbatore": { lat: 11.0168, lng: 76.9558 },
        "Trichy": { lat: 10.7905, lng: 78.7047 }
      };

      const center = districtCenters[district] || { lat: 13.0827, lng: 80.2707 }; // fallback = Chennai

      // 3. Fetch hospitals in the same district (excluding self)
      db.query(
        "SELECT hospitalId, name, address, phone_number,email FROM hospital WHERE district = ? AND hospitalId != ?",
        [district, hospitalId],
        (err2, nearbyHospitals) => {
          if (err2) return res.status(500).json(err2);

          // Fake lat/lng offsets just for visualization on map
          const hospitalsWithOffset = nearbyHospitals.map((h, i) => ({
            ...h,
            // lat: center.lat + 0.01 * (i + 1),
            // lng: center.lng + 0.01 * (i + 1)
            lat: center.lat + 0.001 * (i + 1),
lng: center.lng + 0.001 * (i + 1)

          }));
           console.log("🟢 District:", district);
          console.log("🗺️ Center:", center);
          console.log("🏥 Nearby Hospitals (with offset):", hospitalsWithOffset);
          res.json({
            currentHospital: {
              ...currentHospital,
              lat: center.lat,
              lng: center.lng
            },
            center,
            nearbyHospitals: hospitalsWithOffset
          });
        }
      );
    }
  );
});


// Get nearby hospitals with resource filtering and distance sorting
app.get("/api/hospitals/nearby", async (req, res) => {
  try {
    const { hospitalId, resourceType, minQuantity = 1 } = req.query;
    if (!hospitalId || !resourceType) {
      return res.status(400).json({ error: "Missing hospitalId or resourceType" });
    }

    const [currentHospital] = await dbPromise.query(
      "SELECT latitude, longitude FROM hospital_location WHERE hospitalId = ?",
      [hospitalId]
    );

    if (!currentHospital || currentHospital.length === 0)
      return res.status(404).json({ error: "Hospital not found" });

    const { latitude, longitude } = currentHospital[0];

    const [hospitals] = await dbPromise.query(
      `SELECT hr.hospitalId, h.name, h.address, h.phone_number AS phone,
              hr.available AS quantity, hl.latitude, hl.longitude
       FROM available_resources hr
       JOIN hospital h ON hr.hospitalId = h.hospitalId
       JOIN hospital_location hl ON hr.hospitalId = hl.hospitalId
       WHERE hr.resource_type = ? AND hr.available >= ? AND hr.hospitalId != ?`,
      [resourceType, minQuantity, hospitalId]
    );

    const hospitalsWithDistance = hospitals.map(h => ({
      ...h,
      distance: getDistance(latitude, longitude, h.latitude, h.longitude),
    }));

    const nearby = hospitalsWithDistance.filter(h => h.distance <= 10).sort((a, b) => a.distance - b.distance);
    const remaining = hospitalsWithDistance.filter(h => h.distance > 10).sort((a, b) => a.distance - b.distance);

    res.json([...nearby, ...remaining]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// BORROW REQUESTS

// Get all incoming requests for a hospital (as lender)
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
    // Format date/time fields before sending
    const formatted = results.map(item => ({
      ...item,
      requested_at: formatDateTime(item.requested_at),
      updated_at: formatDateTime(item.updated_at),
      due_date: item.due_date ? item.due_date.toISOString().split('T')[0] : null,
      returned_at: formatDateTime(item.returned_at),
    }));
    res.json(formatted);
  });
});

// Get all borrow requests made by a hospital (as borrower)
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
    // Format date/time fields before sending
    const formatted = results.map(item => ({
      ...item,
      requestedAt: formatDateTime(item.requestedAt),
      updatedAt: formatDateTime(item.updatedAt),
      due_date: item.due_date ? item.due_date.toISOString().split('T')[0] : null,
      returned_at: formatDateTime(item.returned_at),
    }));
    res.json(formatted);
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

// Approve borrow request
app.put("/api/borrow_requests/:id/approve", (req, res) => {
  const requestId = req.params.id;

  db.query(
    "SELECT * FROM borrow_requests WHERE id = ? AND status='pending'",
    [requestId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0)
        return res.status(400).json({ message: "Request not found or already processed" });

      const { toHospitalId, resourceType, quantity, fromHospitalId } = result[0];

      db.query(
        "UPDATE available_resources SET available = available - ? WHERE hospitalId = ? AND resource_type = ? AND available >= ?",
        [quantity, toHospitalId, resourceType, quantity],
        (err2, result2) => {
          if (err2) return res.status(500).json({ error: err2 });
          if (result2.affectedRows === 0)
            return res.status(400).json({ message: "Not enough resources to approve" });

          db.query(
            "UPDATE borrow_requests SET status='approved', updatedAt=NOW() WHERE id=?",
            [requestId],
            (err3) => {
              if (err3) return res.status(500).json({ error: err3 });

              db.query(
                "INSERT INTO transfers (requestId, fromHospitalId, toHospitalId, resourceType, quantity, status) VALUES (?, ?, ?, ?, ?, 'initiated')",
                [requestId, fromHospitalId, toHospitalId, resourceType, quantity],
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

// Reject borrow request
app.put('/api/borrow_requests/:id/reject', (req, res) => {
  const requestId = req.params.id;
  const query = `UPDATE borrow_requests SET status = 'rejected' WHERE id = ?;`;
  db.query(query, [requestId], (err, result) => {
    if (err) {
      console.error('Error rejecting request:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, message: 'Request rejected' });
  });
});

// Return borrowed resource
app.put("/api/borrow_requests/:id/return", (req, res) => {
  const requestId = req.params.id;

  db.query(
    "SELECT * FROM borrow_requests WHERE id = ? AND status='approved' AND return_status='not_returned'",
    [requestId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0)
        return res.status(400).json({ message: "Request not found or already returned" });

      const { toHospitalId, resourceType, quantity } = result[0];

      db.query(
        "UPDATE available_resources SET available = available + ? WHERE hospitalId = ? AND resource_type = ?",
        [quantity, toHospitalId, resourceType],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2 });

          db.query(
            "UPDATE borrow_requests SET return_status='returned', returned_at=NOW(), updatedAt=NOW() WHERE id=?",
            [requestId],
            (err3) => {
              if (err3) return res.status(500).json({ error: err3 });

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

// Equipment condition for a hospital
app.get("/api/equipment/:hospitalId", (req, res) => {
  const { hospitalId } = req.params;
  const sql = "SELECT * FROM equipment_maintenance WHERE hospitalId = ?";
  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error("Error fetching equipment:", err);
      return res.status(500).json({ error: "Database error" });
    }
    const formattedResults = results.map(item => ({
      ...item,
      lastServiced: item.lastServiced ? item.lastServiced.toISOString().split('T')[0] : null,
      nextServiceDue: item.nextServiceDue ? item.nextServiceDue.toISOString().split('T')[0] : null,
    }));
    res.json(formattedResults);
  });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
