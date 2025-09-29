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
import NearbyHospitals from './components/NearbyHospitals'; // ✅ added import
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageHospitals from "./components/admin/ManageHospitals";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/HospitalDashboard" element={<HospitalDashboard />} />
        <Route path="/borrow-request" element={<BorrowRequest />} />
        <Route path="/hospital-resources" element={<HospitalResources />} />       
        <Route path="/incoming-borrow-request" element={<IncomingBorrowRequest />} /> 
        <Route path="/equipment-tracking" element={<EquipmentCondition />} />
        <Route path="/predictions" element={<Prediction/>}/>
        <Route path="/nearby-hospitals" element={<NearbyHospitals />} /> {/* ✅ new route */}
        <Route path="/adminPanel" element={<AdminDashboard />} />
        <Route path="/manage-hospitals" element={<ManageHospitals />} />
      </Routes>
    </Router>
  );
};

export default App;
