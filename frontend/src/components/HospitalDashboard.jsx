import React, { useEffect, useState } from "react";
import axios from "axios";

const HospitalDashboard = () => {
  const [resources, setResources] = useState([]);
  const hospitalId = 'H001'; // Change this to dynamic value based on login/session if needed

  useEffect(() => {
  fetch(`/api/resources/${hospitalId}`)
    .then(res => res.json())
    .then(data => {
      console.log("API data:", data);
      if (Array.isArray(data)) {
        setResources(data);
      } else {
        console.error("Data is not an array:", data);
        setResources([]); // fallback
      }
    })
    .catch(error => {
      console.error('Error fetching resources:', error);
      setResources([]);
    });
}, [hospitalId]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Hospital Dashboard</h2>

      <div className="row">
        {/* Available Resources */}
        <div className="col-md-4 mb-3">
          <div className="card shadow p-3">
            <h5>Available Resources</h5>
            <ul className="mt-2">
              {resources.map((res, index) => (
                <li key={index}>
                  {res.type}: {res.available}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Request Resources */}
        <div className="col-md-4 mb-3">
          <div className="card shadow p-3">
            <h5>Request Resources</h5>
            <button className="btn btn-success w-100 mt-2">Request</button>
          </div>
        </div>

        {/* Incoming Requests */}
        <div className="col-md-4 mb-3">
          <div className="card shadow p-3">
            <h5>Incoming Lend Requests</h5>
            <button className="btn btn-warning w-100 mt-2">View</button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h5>LSTM Prediction</h5>
        <p>Expected Oxygen Demand in 24h: <strong>12 Cylinders</strong></p>
        <p className="text-danger">⚠️ Prepare for resource surge!</p>
      </div>
    </div>
  );
};

export default HospitalDashboard;
