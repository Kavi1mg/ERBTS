import React, { useEffect, useState } from 'react';

function RaiseBorrowPage() {
  const hospitalId = localStorage.getItem('hospitalId'); // Logged-in hospital
  const [myResources, setMyResources] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selected, setSelected] = useState({
    toHospitalId: '',
    resourceType: '',
    quantity: '',
  });

  useEffect(() => {
    if (!hospitalId) return;

    // Fetch your hospital's own resources
    fetch(`http://localhost:3001/api/resources/${hospitalId}`)
      .then(res => res.json())
      .then(data => setMyResources(data));

    // Fetch nearby hospitals and their resources
    fetch(`http://localhost:3001/api/nearby/${hospitalId}`)
      .then(res => res.json())
      .then(data => {
        const hospitals = data.nearbyHospitals;

        // For each nearby hospital, fetch their resources
        Promise.all(
          hospitals.map(h =>
            fetch(`http://localhost:3001/api/resources/${h.hospitalId}`)
              .then(res => res.json())
              .then(resources => ({ ...h, resources }))
          )
        ).then(setNearbyHospitals);
      });
  }, [hospitalId]);

  const handleSubmit = () => {
    const available = myResources.find(r => r.type === selected.resourceType)?.available || 0;
    const needed = parseInt(selected.quantity);

    if (needed <= available) {
      alert("You already have enough resources. Borrow not needed.");
      return;
    }

    if (!selected.toHospitalId || !selected.resourceType || !selected.quantity) {
      alert("Please fill all fields.");
      return;
    }

    const payload = {
      fromHospitalId: hospitalId,
      toHospitalId: selected.toHospitalId,
      resourceType: selected.resourceType,
      quantity: selected.quantity,
    };

    fetch('http://localhost:3001/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setSelected({ toHospitalId: '', resourceType: '', quantity: '' });
      })
      .catch(() => alert('Error creating request'));
  };

  return (
    <div className="container mt-4">
      <h2>Raise Borrow Request</h2>

      <h4>Your Hospital Resources</h4>
      <ul className="list-group mb-4">
        {myResources.map((res, i) => (
          <li className="list-group-item" key={i}>
            {res.type}: <strong>{res.available}</strong>
          </li>
        ))}
      </ul>

      <h4>Nearby Hospitals</h4>
      {nearbyHospitals.length === 0 && <p>No nearby hospitals found.</p>}
      {nearbyHospitals.map((h, i) => (
        <div className="card mb-3" key={i}>
          <div className="card-header">
            {h.name || h.hospitalId} – {h.distance?.toFixed(2)} km away
          </div>
          <ul className="list-group list-group-flush">
            {h.resources.map((res, j) => (
              <li className="list-group-item" key={j}>
                {res.type}: {res.available}
              </li>
            ))}
          </ul>
          <div className="card-footer">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() =>
                setSelected({ ...selected, toHospitalId: h.hospitalId })
              }
            >
              Request from this Hospital
            </button>
          </div>
        </div>
      ))}

      {selected.toHospitalId && (
        <div className="mt-4">
          <h5>Send Request to Hospital: {selected.toHospitalId}</h5>

          <select
            className="form-select mb-2"
            value={selected.resourceType}
            onChange={e =>
              setSelected({ ...selected, resourceType: e.target.value })
            }
          >
            <option value="">Select Resource</option>
            <option value="Oxygen">Oxygen</option>
            <option value="Ventilator">Ventilator</option>
            <option value="Bed">Bed</option>
          </select>

          <input
            type="number"
            placeholder="Enter Quantity"
            className="form-control mb-2"
            value={selected.quantity}
            onChange={e =>
              setSelected({ ...selected, quantity: e.target.value })
            }
          />

          <button className="btn btn-success" onClick={handleSubmit}>
            Submit Request
          </button>
        </div>
      )}
    </div>
  );
}

export default RaiseBorrowPage;
