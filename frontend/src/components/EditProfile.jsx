import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Register.css';
import './Login.css'; // reuse styles
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/logo.png';
import umbrella from '../assets/umbrella.png';

function EditProfile() {
  const [formData, setFormData] = useState({
    hospital_id: '',
    name: '',
    address: '',
    pincode: '',
    phone: '',
    email: '',
    district: '',
    state: ''
  });

  const navigate = useNavigate();

  // Fetch existing data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/profile'); // API returns current hospital data
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load profile data');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3001/profile', formData); // API updates data
      alert('Profile updated successfully!');
      navigate('/dashboard'); // or stay on the same page
    } catch (err) {
      console.error(err);
      alert('Update failed!');
    }
  };

  return (
    <div className="register-page">
      <img src={logo} alt="Logo" className="logo-img" />
      <img src={umbrella} alt="Umbrella" className="umbrella-img" />

      <div className="register-container">
        <h2>Edit Hospital Profile</h2>
        <form onSubmit={handleUpdate}>
          <input type="text" name="hospital_id" placeholder="Hospital ID" value={formData.hospital_id} disabled />
          <input type="text" name="name" placeholder="Hospital Name" value={formData.name} onChange={handleChange} required />
          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required></textarea>
          <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
          <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
