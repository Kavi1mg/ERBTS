import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital } from "react-icons/fa";
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

  const hospitals = [
    { id: "TN_APOLLO", name: "Apollo Hospital" },
    { id: "TN_BILLROTH", name: "Billroth Hospital" },
    { id: "TN_KALYANI", name: "C.S.I. Kalyani Hospital" },
    { id: "TN_FORTISMALAR", name: "Fortis Malar Hospital" },
    { id: "TN_MSSUPER", name: "Govt Multi Super Speciality Hospital" },
    { id: "TN_GGH", name: "Government General Hospital" },
  ];

  const [selectedHospital, setSelectedHospital] = useState("");
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);

  const hospitalDataMap = {
    TN_APOLLO: {
      barDataHospitals: [
        { month: "Jan", hospitals: 3 },
        { month: "Feb", hospitals: 7 },
        { month: "Mar", hospitals: 5 },
      ],
      pieDataRequests: [
        { name: "Approved", value: 10 },
        { name: "Pending", value: 4 },
        { name: "Rejected", value: 1 },
      ],
      stackedBarData: [
        { hospital: "Apollo Hospital", Approved: 8, Pending: 2, Rejected: 1 },
      ],
      resourceUsageData: [{ hospital: "Apollo Hospital", used: 38 }],
      donutData: [
        { name: "Available", value: 70 },
        { name: "Used", value: 30 },
      ],
    },
    TN_BILLROTH: {
      barDataHospitals: [
        { month: "Jan", hospitals: 2 },
        { month: "Feb", hospitals: 6 },
        { month: "Mar", hospitals: 4 },
      ],
      pieDataRequests: [
        { name: "Approved", value: 9 },
        { name: "Pending", value: 3 },
        { name: "Rejected", value: 2 },
      ],
      stackedBarData: [
        { hospital: "Billroth Hospital", Approved: 6, Pending: 3, Rejected: 1 },
      ],
      resourceUsageData: [{ hospital: "Billroth Hospital", used: 33 }],
      donutData: [
        { name: "Available", value: 60 },
        { name: "Used", value: 40 },
      ],
    },
    TN_KALYANI: {
      barDataHospitals: [
        { month: "Jan", hospitals: 5 },
        { month: "Feb", hospitals: 8 },
        { month: "Mar", hospitals: 7 },
      ],
      pieDataRequests: [
        { name: "Approved", value: 12 },
        { name: "Pending", value: 6 },
        { name: "Rejected", value: 0 },
      ],
      stackedBarData: [
        { hospital: "C.S.I. Kalyani Hospital", Approved: 10, Pending: 5, Rejected: 0 },
      ],
      resourceUsageData: [{ hospital: "C.S.I. Kalyani Hospital", used: 50 }],
      donutData: [
        { name: "Available", value: 75 },
        { name: "Used", value: 25 },
      ],
    },
    // add other hospitals here...
  };

  const {
    barDataHospitals = [],
    pieDataRequests = [],
    stackedBarData = [],
    resourceUsageData = [],
    donutData = [],
  } = hospitalDataMap[selectedHospital] || {};

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

  // Color array updating green to purple in pie chart
  const pieColors = ["#BA55D3", "#FFD700", "#FF6347"];

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Admin Dashboard</h1>
        <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>
          👤
        </div>

        {showProfile && (
          <div className="profile-dropdown">
            {!isEditing ? (
              <>
                <div className="profile-info">
                  <p>
                    <strong>ID:</strong> {profile.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {profile.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profile.phone_number}
                  </p>
                  <p>
                    <strong>Role:</strong> {profile.role}
                  </p>
                </div>
                <div className="profile-buttons">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="profile-edit-card">
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
                <div className="profile-buttons">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div
          className="card shadow-sm dashboard-card"
          onClick={() => navigate("/manage-hospitals")}
        >
          <div className="card-body d-flex flex-column align-items-center justify-content-center">
            <div className="card-icon">
              <FaHospital />
            </div>
            <h5 className="card-title mt-2">Manage Hospitals</h5>
          </div>
        </div>

        <div style={{ marginTop: 15, width: "200px" }}>
          <button
            className="btn btn-outline-light"
            onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}
          >
            Hospitals
          </button>

          {showHospitalDropdown && (
            <select
              className="form-select mt-2"
              onChange={(e) => setSelectedHospital(e.target.value)}
              value={selectedHospital}
            >
              <option value="">Select a Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="charts-main-container">
        <div className="charts-row">
          <div className="chart-wrapper">
            <h3>Hospitals Registered per Month</h3>
            <BarChart width={400} height={300} data={barDataHospitals}>
              <XAxis dataKey="month" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="hospitals" fill="#FF4500" />
            </BarChart>
          </div>

          <div className="chart-wrapper">
            <h3>Requests Status</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={pieDataRequests}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={{ fill: "#fff" }}
              >
                {pieDataRequests.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
            </PieChart>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-wrapper">
            <h3>Requests per Hospital</h3>
            <BarChart width={400} height={300} data={stackedBarData}>
              <XAxis dataKey="hospital" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="Approved" stackId="a" fill="#1E90FF" />
              <Bar dataKey="Pending" stackId="a" fill="#32CD32" />
              <Bar dataKey="Rejected" stackId="a" fill="#FF1493" />
            </BarChart>
          </div>

          <div className="chart-wrapper">
            <h3>Resource Usage per Hospital</h3>
            <BarChart width={400} height={300} data={resourceUsageData}>
              <XAxis dataKey="hospital" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />
              <Bar dataKey="used" fill="#FFE4B5" />
            </BarChart>
          </div>
        </div>

        <div className="charts-row single">
          <div className="chart-wrapper">
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
              >
                {donutData.map((entry, index) => (
                  <Cell
                    key={`cell-donut-${index}`}
                    fill={["#00BFFF", "#FF8C00"][index % 2]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#222222ff", color: "#ffffff" }} />
            </PieChart>
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>© ERBTS</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;
