import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import './Login.css'; // reuse styles for logo & umbrella
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/logo.png';
import umbrella from '../assets/umbrella.png';

function Register() {
  const [formData, setFormData] = useState({
    hospital_id: '',
    password: '',
    name: '',
    address: '',
    pincode: '',
    phone: '',
    email: '',
    district: '',
    state: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData,
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/register', formData);
      alert('Registration successful!');
      setFormData({
        hospital_id: '',
        password: '',
        name: '',
        address: '',
        pincode: '',
        phone: '',
        email: '',
        district: '',
        state: ''
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Registration failed!');
    }
  };

  return (
    <div className="register-page">
      {/* Logo */}
      <img src={logo} alt="Logo" className="logo-img" />

      {/* Umbrella */}
      <img src={umbrella} alt="Umbrella" className="umbrella-img" />

      {/* Form Container */}
      <div className="register-container">
        <h2>Hospital Registration</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="hospital_id" placeholder="Hospital ID" value={formData.hospital_id} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="text" name="name" placeholder="Hospital Name" value={formData.name} onChange={handleChange} required />
          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required></textarea>
          <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
          <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account?{' '}
          <Link to="/" className="login-link">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
