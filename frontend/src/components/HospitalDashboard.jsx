// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import './HospitalDashboard.css';
// // import logo from '../assets/logo.png';
// // import { FaInbox, FaExchangeAlt, FaBox, FaHospital, FaChartLine, FaTools } from 'react-icons/fa';

// // function HospitalDashboard() {
// //   const navigate = useNavigate();
// //   const [showProfile, setShowProfile] = useState(false);
// //   const [profile, setProfile] = useState(null);
// //   const hospitalId = localStorage.getItem('hospitalId');

// //   useEffect(() => {
// //     if (hospitalId) {
// //       axios.get(`http://localhost:3001/api/hospital/${hospitalId}`)
// //         .then(res => {
// //           setProfile(res.data);
// //           localStorage.setItem('name', res.data.name);
// //           localStorage.setItem('address', res.data.address);
// //           localStorage.setItem('district', res.data.district);
// //           localStorage.setItem('state', res.data.state);
// //           localStorage.setItem('pincode', res.data.pincode);
// //           localStorage.setItem('phone', res.data.phone_number);
// //           localStorage.setItem('email', res.data.email);
// //         })
// //         .catch(err => {
// //           console.error('Error fetching hospital profile:', err);
// //           alert('Failed to load hospital profile');
// //         });
// //     }
// //   }, [hospitalId]);

// //   const handleLogout = () => {
// //     localStorage.clear();
// //     alert("Thanks for logging in! See you soon.");
// //     navigate("/");
// //   };

// //   const cards = [
// //     { title: "Incoming Requests", icon: <FaInbox />, path: "/incoming-borrow-request" },
// //     { title: "Borrow Request", icon: <FaExchangeAlt />, path: "/borrow-request" },
// //     { title: "Current Resources", icon: <FaBox />, path: "/hospital-resources" },
// //     { title: "Nearby Hospitals", icon: <FaHospital />, path: "/nearby-hospitals" },
// //     { title: "LSTM Prediction", icon: <FaChartLine />, path: "/predictions" },
// //     { title: "Equipment Condition", icon: <FaTools />, path: "/equipment-tracking" },
// //   ];

// //   if (!profile) {
// //     return <div className="loading">Loading profile...</div>;
// //   }

// //   const role = localStorage.getItem('role') || 'N/A';

// //   return (
// //     <div className="hospital-dashboard">
// //       <div className="header-container">
// //         <div className="logo-section">
// //           <img src={logo} alt="Logo" className="logo" />
// //         </div>
// //         <h2 className="header-title">Hospital Dashboard</h2>
// //         <div className="profile-section">
// //           <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>👤</div>
// //           {showProfile && (
// //             <div className="profile-dropdown">
// //               <p><strong>ID:</strong> {hospitalId || 'N/A'}</p>
// //               <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
// //               <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
// //               <p><strong>District:</strong> {profile.district || 'N/A'}</p>
// //               <p><strong>State:</strong> {profile.state || 'N/A'}</p>
// //               <p><strong>Pincode:</strong> {profile.pincode || 'N/A'}</p>
// //               <p><strong>Phone:</strong> {profile.phone_number || 'N/A'}</p>
// //               <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
// //               <p><strong>Role:</strong> {role}</p>
// //               <button className="btn btn-danger btn-sm mt-2" onClick={handleLogout}>Logout</button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //       <div className="dashboard-grid">
// //         {cards.map((card, i) => (
// //           <div 
// //             key={i}
// //             className="card shadow-sm dashboard-card"
// //             onClick={() => navigate(card.path)}
// //           >
// //             <div className="card-body d-flex flex-column align-items-center justify-content-center">
// //               <div className="card-icon">{card.icon}</div>
// //               <h5 className="card-title mt-2">{card.title}</h5>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //       <footer className="dashboard-footer">
// //         <p>© ERBTS</p>
// //       </footer>
// //     </div>
// //   );
// // }

// // export default HospitalDashboard;




// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './HospitalDashboard.css';
// import logo from '../assets/logo.png';
// import { FaInbox, FaExchangeAlt, FaBox, FaHospital, FaChartLine, FaTools } from 'react-icons/fa';

// function HospitalDashboard() {
//   const navigate = useNavigate();
//   const [showProfile, setShowProfile] = useState(false);
//   const [profile, setProfile] = useState(null);
//   const [predictions, setPredictions] = useState(null); // <-- new state for predictions
//   const hospitalId = localStorage.getItem('hospitalId');

//   // Fetch hospital profile
//   useEffect(() => {
//     if (hospitalId) {
//       axios.get(`http://localhost:3001/api/hospital/${hospitalId}`)
//         .then(res => {
//           setProfile(res.data);
//           localStorage.setItem('name', res.data.name);
//           localStorage.setItem('address', res.data.address);
//           localStorage.setItem('district', res.data.district);
//           localStorage.setItem('state', res.data.state);
//           localStorage.setItem('pincode', res.data.pincode);
//           localStorage.setItem('phone', res.data.phone_number);
//           localStorage.setItem('email', res.data.email);
//         })
//         .catch(err => {
//           console.error('Error fetching hospital profile:', err);
//           alert('Failed to load hospital profile');
//         });
//     }
//   }, [hospitalId]);

//   // Fetch predictions from Flask backend
//   useEffect(() => {
//     if (hospitalId) {
//       axios.get('http://127.0.0.1:5000/predict', {
//         headers: { hospitalId }  // <-- send hospitalId in headers
//       })
//       .then(res => {
//         setPredictions(res.data);
//       })
//       .catch(err => console.error('Error fetching predictions:', err));
//     }
//   }, [hospitalId]);

//   const handleLogout = () => {
//     localStorage.clear();
//     alert("Thanks for logging in! See you soon.");
//     navigate("/");
//   };

//   const cards = [
//     { title: "Incoming Requests", icon: <FaInbox />, path: "/incoming-borrow-request" },
//     { title: "Borrow Request", icon: <FaExchangeAlt />, path: "/borrow-request" },
//     { title: "Current Resources", icon: <FaBox />, path: "/hospital-resources" },
//     { title: "Nearby Hospitals", icon: <FaHospital />, path: "/nearby-hospitals" },
//     { title: "LSTM Prediction", icon: <FaChartLine />, path: "/predictions" },
//     { title: "Equipment Condition", icon: <FaTools />, path: "/equipment-tracking" },
//   ];

//   if (!profile) return <div className="loading">Loading profile...</div>;

//   const role = localStorage.getItem('role') || 'N/A';

//   return (
//     <div className="hospital-dashboard">
//       <div className="header-container">
//         <div className="logo-section">
//           <img src={logo} alt="Logo" className="logo" />
//         </div>
//         <h2 className="header-title">Hospital Dashboard</h2>
//         <div className="profile-section">
//           <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>👤</div>
//           {showProfile && (
//             <div className="profile-dropdown">
//               <p><strong>ID:</strong> {hospitalId || 'N/A'}</p>
//               <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
//               <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
//               <p><strong>District:</strong> {profile.district || 'N/A'}</p>
//               <p><strong>State:</strong> {profile.state || 'N/A'}</p>
//               <p><strong>Pincode:</strong> {profile.pincode || 'N/A'}</p>
//               <p><strong>Phone:</strong> {profile.phone_number || 'N/A'}</p>
//               <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
//               <p><strong>Role:</strong> {role}</p>
//               <button className="btn btn-danger btn-sm mt-2" onClick={handleLogout}>Logout</button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="dashboard-grid">
//         {cards.map((card, i) => (
//           <div 
//             key={i}
//             className="card shadow-sm dashboard-card"
//             onClick={() => navigate(card.path)}
//           >
//             <div className="card-body d-flex flex-column align-items-center justify-content-center">
//               <div className="card-icon">{card.icon}</div>
//               <h5 className="card-title mt-2">{card.title}</h5>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Display predictions */}
//       {/* {predictions && (
//         <div className="predictions-section">
//           <h3>LSTM Predictions for {predictions.hospitalId}</h3>
//           <p>Date: {predictions.date}</p>
//           <ul>
//             {Object.entries(predictions.predictions).map(([resource, value]) => (
//               <li key={resource}>{resource}: {value}</li>
//             ))}
//           </ul>
//         </div>
//       )} */}

//       <footer className="dashboard-footer">
//         <p>© ERBTS</p>
//       </footer>
//     </div>
//   );
// }

// export default HospitalDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HospitalDashboard.css';
import logo from '../assets/logo.png';
import { FaInbox, FaExchangeAlt, FaBox, FaHospital, FaChartLine, FaTools } from 'react-icons/fa';

function HospitalDashboard() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const hospitalId = localStorage.getItem('hospitalId');
console.log('Hospital ID:', hospitalId);
  useEffect(() => {
    if (hospitalId) {
      axios.get(`http://localhost:3001/api/hospital/${hospitalId}`)
        .then(res => {
          setProfile(res.data);
          localStorage.setItem('name', res.data.name);
          localStorage.setItem('address', res.data.address);
          localStorage.setItem('district', res.data.district);
          localStorage.setItem('state', res.data.state);
          localStorage.setItem('pincode', res.data.pincode);
          localStorage.setItem('phone', res.data.phone_number);
          localStorage.setItem('email', res.data.email);
        })
        .catch(err => {
          console.error('Error fetching hospital profile:', err);
          alert('Failed to load hospital profile');
        });
    }
  }, [hospitalId]);

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

  if (!profile) return <div className="loading">Loading profile...</div>;

  const role = localStorage.getItem('role') || 'N/A';

  return (
    <div className="hospital-dashboard">
      <div className="header-container">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <h2 className="header-title">Hospital Dashboard</h2>
        <div className="profile-section">
          <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>👤</div>
          {showProfile && (
            <div className="profile-dropdown">
              <p><strong>ID:</strong> {hospitalId || 'N/A'}</p>
              <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
              <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
              <p><strong>District:</strong> {profile.district || 'N/A'}</p>
              <p><strong>State:</strong> {profile.state || 'N/A'}</p>
              <p><strong>Pincode:</strong> {profile.pincode || 'N/A'}</p>
              <p><strong>Phone:</strong> {profile.phone_number || 'N/A'}</p>
              <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
              <p><strong>Role:</strong> {role}</p>
              <button className="btn btn-danger btn-sm mt-2" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

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

      <footer className="dashboard-footer">
        <p>© ERBTS</p>
      </footer>
    </div>
  );
}

<<<<<<< HEAD
export default HospitalDashboard;
=======
export default HospitalDashboard;
>>>>>>> a9ad309f862eaea35ea96564bb3a3facb4153838
