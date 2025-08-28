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

db.connect(err => {
 if (err) {
 console.error('Database connection failed:', err.stack);
 return;
 }
 console.log('Connected to MySQL');
});

// Login API
app.post('/api/login', (req, res) => {
 const { role, hospitalId, password } = req.body;

 if (!role || !hospitalId || !password) {
 return res.status(400).json({ success: false, message: 'Missing credentials' });
 }

 if (role === 'hospital') {
 // Check in hospital table
 const query = 'SELECT hospitalId, password FROM hospital WHERE hospitalId = ? AND password = ?';
 db.query(query, [hospitalId, password], (err, results) => {
 if (err) {
 console.error(err);
 return res.status(500).json({ success: false, message: 'Database error' });
 }
 if (results.length === 1) {
 return res.json({ success: true, hospitalId, role });
 } else {
 return res.json({ success: false, message: 'Invalid credentials' });
 }
 });
 } else if (role === 'admin') {
 // Check in login table for admin role
 const query = 'SELECT hospitalId, password FROM login WHERE hospitalId = ? AND password = ? AND role = ?';
 db.query(query, [hospitalId, password, 'admin'], (err, results) => {
 if (err) {
 console.error(err);
 return res.status(500).json({ success: false, message: 'Database error' });
 }
 if (results.length === 1) {
 return res.json({ success: true, hospitalId, role });
 } else {
 return res.json({ success: false, message: 'Invalid credentials' });
 }
 });
 } else {
 // Invalid role
 return res.status(400).json({ success: false, message: 'Invalid role' });
 }
});

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

const PORT = 3001;
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
