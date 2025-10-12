import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital } from "react-icons/fa";
import axios from "axios";
import logo from "../../assets/logo.png";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    id: "admin001",
    name: "Admin User",
    email: "admin@example.com",
    phone_number: "9999999999",
    role: "Admin",
  });

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);

  // Data states
  const [resources, setResources] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // Static data for demo
  const hospitalRegistrations = [
    { month: "Jan", hospitals: 3 },
    { month: "Feb", hospitals: 7 },
    { month: "Mar", hospitals: 5 },
  ];

  useEffect(() => {
    axios.get("http://localhost:3001/hospitals")
      .then(res => {
        const hospitalsArray = Object.entries(res.data).map(([id, name]) => ({ id, name }));
        setHospitals(hospitalsArray);
      })
      .catch(err => console.error("Failed fetching hospitals", err));
  }, []);

  useEffect(() => {
    if (!selectedHospital) return;

    axios.get(`http://localhost:3001/api/resources/${selectedHospital}`)
      .then(res => setResources(res.data))
      .catch(err => console.error("Failed fetching resources", err));

    axios.get(`http://localhost:3001/api/borrow_requests/${selectedHospital}`)
      .then(res => setBorrowRequests(res.data))
      .catch(err => console.error("Failed fetching borrow requests", err));

    axios.get(`http://localhost:3001/api/incoming_requests/${selectedHospital}`)
      .then(res => setIncomingRequests(res.data))
      .catch(err => console.error("Failed fetching incoming requests", err));
  }, [selectedHospital]);

  const handleLogout = () => {
    localStorage.clear();
    alert("Logged out successfully!");
    navigate("/");
  };

  const handleSave = () => {
    alert("Profile updated!");
    setIsEditing(false);
    setShowProfile(false);
  };

  // Calculate request status counts for pie chart (Incoming requests)
  const approvedCount = incomingRequests.filter(r => r.status === "approved").length;
  const pendingCount = incomingRequests.filter(r => r.status === "pending").length;
  const rejectedCount = incomingRequests.filter(r => r.status === "rejected").length;

  const pieDataRequests = [
    { name: "Approved", value: approvedCount },
    { name: "Pending", value: pendingCount },
    { name: "Rejected", value: rejectedCount },
  ];

  // Requests per hospital (stacked bar) - from borrowRequests
  const approvedReq = borrowRequests.filter(r => r.status === "approved").length;
  const pendingReq = borrowRequests.filter(r => r.status === "pending").length;
  const rejectedReq = borrowRequests.filter(r => r.status === "rejected").length;

  const hospitalName = hospitals.find(h => h.id === selectedHospital)?.name || "Hospital";

  const stackedBarData = [
    { hospital: hospitalName, Approved: approvedReq, Pending: pendingReq, Rejected: rejectedReq },
  ];

  // Resource usage (used = total_quantity - available)
  const totalQuantity = resources.reduce((sum, r) => sum + (r.total_quantity || 0), 0);
  const totalAvailable = resources.reduce((sum, r) => sum + (r.available || 0), 0);
  const usedQuantity = totalQuantity - totalAvailable;

  const resourceUsageData = [{ hospital: hospitalName, used: usedQuantity >= 0 ? usedQuantity : 0 }];

  const donutData = [
    { name: "Available", value: totalAvailable },
    { name: "Used", value: usedQuantity >= 0 ? usedQuantity : 0 },
  ];

  // Chart colors
  const pieColors = ["#BA55D3", "#FFD700", "#FF6347"];
  const stackedColors = ["#1E90FF", "#32CD32", "#FF1493"];

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <img src={logo} alt="Logo" className="admin-logo" />
        <h1>Admin Dashboard</h1>
        <div className="admin-profile-icon" onClick={() => setShowProfile(!showProfile)}>👤</div>

        {showProfile && (
          <div className="admin-profile-dropdown">
            {!isEditing ? (
              <>
                <div className="admin-profile-info">
                  <p><strong>ID:</strong> {profile.id}</p>
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Phone:</strong> {profile.phone_number}</p>
                  <p><strong>Role:</strong> {profile.role}</p>
                </div>
                <div className="admin-profile-buttons">
                  <button className="admin-btn-primary btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="admin-btn-danger btn-sm" onClick={handleLogout}>Logout</button>
                </div>
              </>
            ) : (
              <div className="admin-profile-edit-card">
                <h3>Edit Profile</h3>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  placeholder="Phone"
                />
                <div className="admin-profile-buttons">
                  <button className="admin-btn-success btn-sm" onClick={handleSave}>Save</button>
                  <button className="admin-btn-danger btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-card" onClick={() => navigate("/manage-hospitals")}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center">
            <div className="admin-card-icon"><FaHospital /></div>
            <h5 className="card-title mt-2">Manage Hospitals</h5>
          </div>
        </div>

        <div style={{ marginTop: 15, width: "200px" }}>
          <button className="admin-btn-outline-light" onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}>
            Hospitals
          </button>

          {showHospitalDropdown && (
            <select
              className="admin-form-select mt-2"
              onChange={(e) => setSelectedHospital(e.target.value)}
              value={selectedHospital}
            >
              <option value="">Select a Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="admin-charts-container">
        <div className="admin-charts-row">
          <div className="admin-chart-wrapper">
            <h3>Hospitals Registered per Month</h3>
            <BarChart width={400} height={300} data={hospitalRegistrations}>
              <XAxis dataKey="month" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="hospitals" fill="#FF4500" />
            </BarChart>
          </div>

          <div className="admin-chart-wrapper">
            <h3>Requests Status (Incoming)</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={pieDataRequests}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={{ fill: "#fff" }}
                isAnimationActive={false}
              >
                {pieDataRequests.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
            </PieChart>
          </div>
        </div>

        <div className="admin-charts-row">
          <div className="admin-chart-wrapper">
            <h3>Requests per Hospital (Borrowed)</h3>
            <BarChart width={400} height={300} data={stackedBarData}>
              <XAxis dataKey="hospital" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="Approved" stackId="a" fill={stackedColors[0]} />
              <Bar dataKey="Pending" stackId="a" fill={stackedColors[1]} />
              <Bar dataKey="Rejected" stackId="a" fill={stackedColors[2]} />
            </BarChart>
          </div>

          <div className="admin-chart-wrapper">
            <h3>Resource Usage per Hospital</h3>
            <BarChart width={400} height={300} data={resourceUsageData}>
              <XAxis dataKey="hospital" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Bar dataKey="used" fill="#FFE4B5" />
            </BarChart>
          </div>
        </div>

        <div className="admin-charts-row single">
          <div className="admin-chart-wrapper">
            <h3>Resource Availability</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                label={{ fill: "#fff" }}
                isAnimationActive={false}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-donut-${index}`} fill={["#00BFFF", "#FF8C00"][index % 2]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#222222ff", color: "#ffffff" }} />
            </PieChart>
          </div>
        </div>
      </div>

      <footer className="admin-dashboard-footer">
        <p>© ERBTS</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;
