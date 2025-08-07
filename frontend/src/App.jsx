// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HospitalDashboard from './components/HospitalDashboard';
import RequestResource from './components/RequestResource'; // we'll create this next
import HospitalResources from "./components/HospitalResources"; 
import Register from './components/Register';
import RaiseBorrowRequest from './components/RaiseBorrowRequest';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/HospitalDashboard" element={<HospitalDashboard />} />
        <Route path="/request-resource" element={<RequestResource />} />
        <Route path="/hospital-resources" element={<HospitalResources />} />       
         
         <Route path="/hospital/raise-borrow" element={<RaiseBorrowRequest />} />

      </Routes>
    </Router>
  );
};

export default App;
