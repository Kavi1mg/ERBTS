import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaHospital, FaAmbulance, FaProcedures, FaLungs } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./BorrowRequest.css";

const BorrowRequest = () => {
  const navigate = useNavigate();
  const hospitalId = localStorage.getItem("hospitalId");

  const [showForm, setShowForm] = useState(false);
  const [resourceType, setResourceType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [toHospitalId, setToHospitalId] = useState("");

  const [borrowRequests, setBorrowRequests] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);

  // Fetch borrow requests on mount
  useEffect(() => {
    fetchBorrowRequests();
    fetchHospitals();
  }, []);

  const fetchBorrowRequests = () => {
    fetch(`http://localhost:3001/api/borrow_requests/${hospitalId}`)
      .then((res) => res.json())
      .then((data) => setBorrowRequests(data))
      .catch((err) => console.error("Error fetching borrow requests:", err));
  };

  const fetchHospitals = () => {
    fetch(`http://localhost:3001/api/hospitals`)
      .then((res) => res.json())
      .then((data) => setHospitalList(data.filter(h => h.hospitalId !== hospitalId)))
      .catch((err) => console.error("Error fetching hospitals:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resourceType || !quantity || !urgencyLevel || !toHospitalId) return;

    fetch("http://localhost:3001/api/borrow_requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromHospitalId: hospitalId,
        toHospitalId,
        resourceType,
        quantity,
        urgency_level: urgencyLevel,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchBorrowRequests();
        setShowForm(false);
        setResourceType("");
        setQuantity("");
        setUrgencyLevel("");
        setToHospitalId("");
      })
      .catch((err) => console.error("Error submitting request:", err));
  };

  const handleReturn = (id) => {
    fetch(`http://localhost:3001/api/borrow_requests/${id}/return`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then(() => fetchBorrowRequests())
      .catch((err) => console.error("Error marking return:", err));
  };

  const iconForResourceType = (type) => {
    switch (type.toLowerCase()) {
      case "ambulance":
        return <FaAmbulance color="#2563eb" />;
      case "ventilator":
        return <FaLungs color="#1e40af" />;
      case "oxygen cylinder":
        return <FaProcedures color="#3b82f6" />;
      case "icu beds":
        return <FaHospital color="#2563eb" />;
      default:
        return "🩺";
    }
  };

  return (
    <div className="borrow-request-page">
      <IoArrowBack
        className="back-icon"
        onClick={() => navigate(-1)}
        title="Go Back"
      />

      <header className="page-header">
        <h1>Borrow Requests</h1>
      </header>

      <button
        className="make-request-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Close Request Form" : "Make a Request"}
      </button>

      {showForm && (
        <form className="request-form" onSubmit={handleSubmit}>
          <label>
            Select Hospital:
            <select
              value={toHospitalId}
              onChange={(e) => setToHospitalId(e.target.value)}
              required
            >
              <option value="">Select Hospital</option>
              {hospitalList.map((h) => (
                <option key={h.hospitalId} value={h.hospitalId}>
                  {h.name} ({h.hospitalId})
                </option>
              ))}
            </select>
          </label>

          <label>
            Resource Type:
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="Ambulance">🚑 Ambulance</option>
              <option value="Ventilator">🫁 Ventilator</option>
              <option value="Oxygen Cylinder">🧪 Oxygen Cylinder</option>
              <option value="ICU Beds">🏥 ICU Beds</option>
            </select>
          </label>

          <label>
            Quantity:
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>

          <label>
            Urgency Level:
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      )}

      <table className="request-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Hospital Name</th>
            <th>Resource Type</th>
            <th>Quantity</th>
            <th>Urgency Level</th>
            <th>Requested At</th>
            <th>Updated At</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Returned At</th>
            <th>Return Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {borrowRequests.map((req, idx) => (
            <tr key={req.id}>
              <td>{idx + 1}</td>
              <td>{req.toHospitalName}</td>
              <td>
                {iconForResourceType(req.resourceType)} {req.resourceType}
              </td>
              <td>{req.quantity}</td>
              <td className={`urgency ${req.urgency_level.toLowerCase()}`}>
                {req.urgency_level}
              </td>
              <td>{req.requestedAt}</td>
              <td>{req.updatedAt}</td>
              <td className={`status ${req.status.toLowerCase()}`}>
                {req.status}
              </td>
              <td>{req.due_date || "-"}</td>
              <td>{req.returned_at || "-"}</td>
              <td>{req.return_status}</td>
              <td>
                {req.return_status === "not_returned" && req.status === "approved" ? (
                  <button
                    className="btn-return"
                    onClick={() => handleReturn(req.id)}
                  >
                    Return
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BorrowRequest;



