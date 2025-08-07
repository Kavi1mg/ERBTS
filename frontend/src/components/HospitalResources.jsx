// HospitalResources.jsx
import React, { useEffect, useState } from 'react';

const HospitalResources = () => {
  const [resources, setResources] = useState([]);
  const hospitalId = localStorage.getItem('hospitalId');

  useEffect(() => {
   fetch(`http://localhost:3001/api/resources/${hospitalId}`)

      .then(res => res.json())
      .then(data => setResources(data))
      .catch(err => console.error('Error fetching resources:', err));
  }, [hospitalId]);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">📋 Your Current Hospital Resources</h3>
      <table className="table table-striped table-bordered">
        <thead className="table-success">
          <tr>
            <th>#</th>
            <th>Resource Type</th>
            <th>Available Quantity</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((res, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{res.type}</td>
              <td>{res.available}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HospitalResources;
