import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RaiseBorrowRequest() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [quantity, setQuantity] = useState('');
  const navigate = useNavigate();

  const fromHospitalId = localStorage.getItem('hospitalId');

  // Fetch nearby hospitals
  useEffect(() => {
    fetch(`http://localhost:3001/api/nearby/${fromHospitalId}`)
      .then((res) => res.json())
      .then((data) => setHospitals(data.nearbyHospitals || []));
  }, [fromHospitalId]);

  // Fetch selected hospital's resources
  const handleHospitalClick = (hospitalId) => {
    setSelectedHospital(hospitalId);
    fetch(`http://localhost:3001/api/resources/${hospitalId}`)
      .then((res) => res.json())
      .then((data) => setResources(data));
  };

  // Submit borrow request
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedHospital || !selectedResource || !quantity) {
      alert('Please select all fields');
      return;
    }

    fetch('http://localhost:3001/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromHospitalId,
        toHospitalId: selectedHospital,
        resourceType: selectedResource,
        quantity,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert('Borrow request sent!');
        navigate('/hospital-dashboard');
      });
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">➕ Raise Borrow Request</h3>

      <div className="row">
        <div className="col-md-6">
          <h5>🏥 Nearby Hospitals</h5>
          <ul className="list-group">
            {hospitals.map((hospital) => (
              <li
                key={hospital.hospitalId}
                className={`list-group-item ${selectedHospital === hospital.hospitalId ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleHospitalClick(hospital.hospitalId)}
              >
                {hospital.hospitalName || 'Hospital'} (ID: {hospital.hospitalId})
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-6">
          {selectedHospital && (
            <>
              <h5>📦 Resources at Hospital ID: {selectedHospital}</h5>
              <ul className="list-group mb-3">
                {resources.map((res, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between">
                    <span>{res.type}</span>
                    <strong>{res.available}</strong>
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label>Select Resource Type:</label>
                  <select
                    className="form-select"
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {resources.map((r, i) => (
                      <option key={i} value={r.type}>
                        {r.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Send Request
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RaiseBorrowRequest;
