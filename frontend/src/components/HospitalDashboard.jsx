// src/components/HospitalDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalDashboard.css'; // Custom CSS

function HospitalDashboard() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [predicted, setPredicted] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'hospital') navigate('/hospital-login');

    // Fetch hospital resources
    fetch('/api/resources/current')
      .then(res => res.json())
      .then(data => setResources(data));

    // Fetch incoming requests
    fetch('/api/borrow/incoming')
      .then(res => res.json())
      .then(data => setRequests(data));

    // Fetch predictions
    fetch('/api/predictions/123') // Replace 123 with dynamic hospitalId
      .then(res => res.json())
      .then(data => setPredicted(data));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/hospital-login');
  };

  const handleInputChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitRequest = e => {
    e.preventDefault();
    fetch('/api/borrow/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(() => {
        alert('Request submitted');
        setShowModal(false);
      });
  };

  return (
    <div className="container hospital-dashboard mt-4">
      <h2 className="mb-3">🏥 Hospital Dashboard</h2>

      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Raise Borrow Request
        </button>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="row g-4">
        {/* Current Stock */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">📦 Current Resources</div>
            <ul className="list-group list-group-flush">
              {resources.map((res, i) => (
                <li className="list-group-item" key={i}>
                  {res.type}: <strong>{res.quantity}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Predicted Demand */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">📈 Predicted Demand</div>
            <ul className="list-group list-group-flush">
              {predicted.map((item, i) => (
                <li className="list-group-item" key={i}>
                  {item.type}: <strong>{item.predicted_quantity}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Incoming Borrow Requests */}
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-warning">📬 Incoming Borrow Requests</div>
            <ul className="list-group list-group-flush">
              {requests.map((req, i) => (
                <li className="list-group-item d-flex justify-content-between" key={i}>
                  <span>
                    {req.fromHospital} requests <strong>{req.quantity}</strong> of{' '}
                    {req.type} due to: <em>{req.reason}</em>
                  </span>
                  <div>
                    <button className="btn btn-sm btn-success me-2">Accept</button>
                    <button className="btn btn-sm btn-danger">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Map View */}
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white">🗺️ Nearby Hospitals (Map View)</div>
            <div className="card-body">
              <div className="map-placeholder">Google Map goes here</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSubmitRequest}>
              <div className="modal-header">
                <h5 className="modal-title">Raise Borrow Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label>Type:</label>
                <select
                  name="type"
                  className="form-select mb-2"
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Oxygen">Oxygen</option>
                  <option value="Ventilator">Ventilator</option>
                  <option value="Bed">Bed</option>
                </select>
                <label>Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control mb-2"
                  onChange={handleInputChange}
                  required
                />
                <label>Reason:</label>
                <textarea
                  name="reason"
                  className="form-control"
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalDashboard;
