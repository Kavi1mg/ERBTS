// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HospitalDashboard from './components/HospitalDashboard';
import HospitalList from './components/HospitalList';
import HospitalResources from "./components/HospitalResources"; 
import Register from './components/Register';
import BorrowRequestForm from './components/BorrowRequestForm';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/HospitalDashboard" element={<HospitalDashboard />} />
        <Route path="/hospital-list" element={<HospitalList/>}/>
        <Route path="/borrow-request-form" element={<BorrowRequestForm />} />

        <Route path="/hospital-resources" element={<HospitalResources />} />       
      </Routes>
    </Router>
  );
};

export default App;
