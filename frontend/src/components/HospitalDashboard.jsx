import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalDashboard.css';
import logo from '../assets/logo.png';
import { FaInbox, FaExchangeAlt, FaBox, FaHospital, FaChartLine, FaTools } from 'react-icons/fa';

function HospitalDashboard() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const hospitalId = localStorage.getItem('hospital_id') || 'N/A';
  const name = localStorage.getItem('name') || 'N/A';
  const address = localStorage.getItem('address') || 'N/A';
  const district = localStorage.getItem('district') || 'N/A';
  const state = localStorage.getItem('state') || 'N/A';
  const pincode = localStorage.getItem('pincode') || 'N/A';
  const phone = localStorage.getItem('phone') || 'N/A';
  const email = localStorage.getItem('email') || 'N/A';
  const role = localStorage.getItem('role') || 'N/A';

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

      {/* ✅ Fixed Header */}
      <div className="header-container">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <h2 className="header-title">Hospital Dashboard</h2>
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
      </div>

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

      
      {/* Map Section */}
      <div className="dashboard-map-section">
        <iframe
          title="Hospital Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242117.9946477976!2d72.74109960701266!3d19.0825223072858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c1b62a2c2a9f%3A0x2c7aa8ff1a07563b!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1660218208696!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© ERBTS</p>
      </footer>

    </div>
  );
}

export default HospitalDashboard;
