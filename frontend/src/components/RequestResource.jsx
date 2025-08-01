import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RequestResource = () => {
  const [formData, setFormData] = useState({
    name: '',
    resourceType: '',
    reason: ''
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
      const hospitalId = localStorage.getItem('hospitalId'); // Get hospitalId stored after login

      if (!hospitalId) {
        alert('You must be logged in to submit a request.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/request-resource', {
        hospitalId,
        ...formData,
        pincode: '560001' // Hardcoded pincode for now
      });

      if (response.data.success) {
        alert('Request submitted successfully!');
        setFormData({ name: '', resourceType: '', reason: '' });
        navigate('/dashboard');
      } else {
        alert('Submission failed. Try again.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Request a Resource</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name of Requester:</label><br />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Resource Type:</label><br />
          <select
            name="resourceType"
            value={formData.resourceType}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="oxygen">Oxygen Cylinder</option>
            <option value="ventilator">Ventilator</option>
            <option value="ambulance">Ambulance</option>
          </select>
        </div>

        <div>
          <label>Reason:</label><br />
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        <br />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestResource;
