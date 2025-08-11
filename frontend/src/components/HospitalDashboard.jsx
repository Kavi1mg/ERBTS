import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalDashboard.css';

function HospitalDashboard() {
  const navigate = useNavigate();
  const hospitalId = localStorage.getItem('hospitalId');
  const role = localStorage.getItem('role');

  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [predicted, setPredicted] = useState([]);
  const [loading, setLoading] = useState(true);

  // Borrow Request Form
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    if (role !== 'hospital') navigate('/hospital-login');

    const fetchData = async () => {
      try {
        setLoading(true);

        const resData = await fetch(`/api/resources/${hospitalId}`).then(res => res.json());
        setResources(resData);

        const reqData = await fetch(`/api/borrow/${hospitalId}`).then(res => res.json());
        setRequests(reqData);

        const predData = await fetch(`/api/predictions/${hospitalId}`).then(res => res.json());
        setPredicted(predData);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, hospitalId, role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/hospital-login');
  };

  const handleInputChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitRequest = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/borrow/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fromHospitalId: hospitalId }),
      });

      if (res.ok) {
        alert('Borrow request submitted');
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBorrowAction = async (id, action) => {
    try {
      const res = await fetch(`/api/borrow/${id}/${action}`, { method: 'PUT' });
      if (res.ok) {
        alert(`Request ${action}ed`);
        setRequests(requests.filter(r => r.id !== id)); // Remove handled request
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading Dashboard...</div>;

  return (
    <div className="container hospital-dashboard mt-4">
      <h2 className="mb-3">🏥 Hospital Dashboard</h2>

      <div className="d-flex justify-content-between mb-3">
       <button
  className="btn btn-primary"
  onClick={() => navigate("/hospital-list")}
>
  ➕ Raise Borrow Request
</button>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="row g-4">
        {/* Current Stock */}
        <div className="col-md-6">
          <div
            className="card shadow-sm"
            onClick={() => navigate('/hospital-resources')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-header bg-success text-white">📦 Current Resources</div>
            <ul className="list-group list-group-flush">
              {resources.length > 0 ? (
                resources.map((res, i) => (
                  <li className="list-group-item" key={i}>
                    {res.type}: <strong>{res.available}</strong>
                  </li>
                ))
              ) : (
                <li className="list-group-item">No resources found</li>
              )}
            </ul>
          </div>
        </div>

        {/* Predicted Demand */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">📈 Predicted Demand (LSTM)</div>
            <ul className="list-group list-group-flush">
              {predicted.length > 0 ? (
                predicted.map((item, i) => (
                  <li className="list-group-item" key={i}>
                    {item.type}: <strong>{item.predicted_quantity}</strong>
                  </li>
                ))
              ) : (
                <li className="list-group-item">No prediction data</li>
              )}
            </ul>
          </div>
        </div>

        {/* Incoming Borrow Requests */}
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-warning">📬 Incoming Borrow Requests</div>
            <ul className="list-group list-group-flush">
              {requests.length > 0 ? (
                requests.map((req, i) => (
                  <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                    <span>
                      {req.fromHospitalId} requests <strong>{req.quantity}</strong> of{' '}
                      {req.resourceType} due to: <em>{req.reason}</em>
                    </span>
                    <div>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleBorrowAction(req.id, 'approve')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleBorrowAction(req.id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="list-group-item">No incoming requests</li>
              )}
            </ul>
          </div>
        </div>

        {/* Map View */}
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white">🗺️ Nearby Hospitals</div>
            <div className="card-body">
              <div className="map-placeholder" style={{ height: '300px', background: '#eaeaea' }}>
                Google Map will be displayed here
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Request Modal */}
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
                  <option value="Oxygen Cylinders">Oxygen Cylinders</option>
                  <option value="Ventilators">Ventilators</option>
                  <option value="Beds">Beds</option>
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
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
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
