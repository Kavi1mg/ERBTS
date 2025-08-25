import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalDashboard.css';
import logo from '../assets/logo.png'; // ✅ correct import
import { FaInbox, FaExchangeAlt, FaBox, FaHospital, FaChartLine, FaTools } from 'react-icons/fa';

function HospitalDashboard() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const hospitalId = localStorage.getItem('hospital_id');
  const name = localStorage.getItem('name');
  const address = localStorage.getItem('address');
  const district = localStorage.getItem('district');
  const state = localStorage.getItem('state');
  const pincode = localStorage.getItem('pincode');
  const phone = localStorage.getItem('phone');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    alert("Thanks for logging in! See you soon.");
    navigate("/");
  };

  const cards = [
    { title: "Incoming Requests", icon: <FaInbox />, path: "/incoming-borrow-request" },
    { title: "Borrow Request", icon: <FaExchangeAlt />, path: "/borrow-request" },
    { title: "Current Resources", icon: <FaBox />, path: "/hospital-resources" },
    { title: "Nearby Hospitals", icon: <FaHospital />, path: "/nearby-hospitals" },
    { title: "LSTM Prediction", icon: <FaChartLine />, path: "/predictions" },
    { title: "Equipment Condition", icon: <FaTools />, path: "/equipment-tracking" },
  ];

  return (
    <div className="hospital-dashboard">
      {/* Logo top-left */}
      <div className="logo-section">
        <img src={logo} alt="Logo" className="logo" /> {/* ✅ fixed here */}
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>👤</div>
        {showProfile && (
          <div className="profile-dropdown">
            <p><strong>ID:</strong> {hospitalId}</p>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>District:</strong> {district}</p>
            <p><strong>State:</strong> {state}</p>
            <p><strong>Pincode:</strong> {pincode}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Role:</strong> {role}</p>
            <button className="btn btn-danger btn-sm mt-2" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {/* Title */}
      <h2 className="mb-4">Hospital Dashboard</h2>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {cards.map((card, i) => (
          <div 
            key={i} 
            className="card shadow-sm dashboard-card" 
            onClick={() => navigate(card.path)}
          >
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <div className="card-icon">{card.icon}</div>
              <h5 className="card-title mt-2">{card.title}</h5>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© ERBTS</p>
      </footer>
    </div>
  );
}

export default HospitalDashboard;
