import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HospitalDashboard from './components/HospitalDashboard';
import HospitalResources from "./components/HospitalResources"; 
import Register from './components/Register';
import BorrowRequest from './components/BorrowRequest';
import IncomingBorrowRequest from './components/IncomingBorrowRequest'; 
import EquipmentCondition from './components/EquipmentCondition';
import Prediction from './components/prediction';
import EditProfile from './components/EditProfile'; 
import NearbyHospitals from './components/NearbyHospitals'; // ✅ added import
import AdminDashboard from "./components/AdminDashboard";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/HospitalDashboard" element={<HospitalDashboard />} />
        <Route path="/borrow-request" element={<BorrowRequest />} />
        <Route path="/hospital-resources" element={<HospitalResources />} />       
        <Route path="/incoming-borrow-request" element={<IncomingBorrowRequest />} /> 
        <Route path="/equipment-tracking" element={<EquipmentCondition />} />
        <Route path="/predictions" element={<Prediction/>}/>
        <Route path="/edit-profile" element={<EditProfile />} /> 
        <Route path="/nearby-hospitals" element={<NearbyHospitals />} /> {/* ✅ new route */}
      </Routes>
    </Router>
  );
};

export default App;
