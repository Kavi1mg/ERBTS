import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaHospital, FaAmbulance, FaProcedures, FaLungs } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./BorrowRequest.css";

const BorrowRequest = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [resourceType, setResourceType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");

  // Initialize empty arrays instead of hardcoding data
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);

  // Fetch data from backend on mount
  useEffect(() => {
    fetch("/api/borrow-requests")
      .then((res) => res.json())
      .then((data) => setBorrowRequests(data))
      .catch((err) => console.error("Error fetching requests:", err));

    fetch("/api/hospitals")
      .then((res) => res.json())
      .then((data) => setHospitalList(data))
      .catch((err) => console.error("Error fetching hospitals:", err));
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resourceType || !quantity || !urgencyLevel) return;

    const newRequest = {
      toHospitalId: "Select Hospital",
      resourceType,
      quantity: Number(quantity),
      urgency_level: urgencyLevel,
      status: "pending",
      requestedAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      due_date: "-",
      returned_at: null,
      return_status: "not_returned",
    };

    fetch("/api/borrow-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRequest),
    })
      .then((res) => res.json())
      .then((savedRequest) => {
        setBorrowRequests([...borrowRequests, savedRequest]);
        setResourceType("");
        setQuantity("");
        setUrgencyLevel("");
        setShowForm(false);
        setFilteredHospitals(hospitalList);
      })
      .catch((err) => console.error("Error submitting request:", err));
  };

  const handleReturn = (id) => {
    const today = new Date().toISOString().split("T")[0];

    fetch(`/api/borrow-requests/${id}/return`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ return_status: "returned", returned_at: today }),
    })
      .then((res) => res.json())
      .then((updatedRequest) => {
        const updated = borrowRequests.map((req) =>
          req.id === id ? updatedRequest : req
        );
        setBorrowRequests(updated);
      })
      .catch((err) => console.error("Error returning resource:", err));
  };

  const handleBorrow = (hospitalId) => {
    fetch(`/api/hospitals/${hospitalId}/borrow`, { method: "POST" })
      .then((res) => res.json())
      .then(() => {
        alert(`Borrow request sent to hospital ID: ${hospitalId}`);
      })
      .catch((err) => console.error("Error sending borrow request:", err));
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
              <option value="High" style={{ color: "#dc2626" }}>
                High
              </option>
              <option value="Medium" style={{ color: "#2563eb" }}>
                Medium
              </option>
              <option value="Low" style={{ color: "#16a34a" }}>
                Low
              </option>
            </select>
          </label>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      )}

      {/* Requests Table (Hospital Name column removed) */}
      <table className="request-table">
        <thead>
          <tr>
            <th>S.No</th>
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
              <td>{req.due_date}</td>
              <td>{req.returned_at || "-"}</td>
              <td>{req.return_status}</td>
              <td>
                <button
                  className="btn-return"
                  onClick={() => handleReturn(req.id)}
                  title="Mark as Returned"
                >
                  Return
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredHospitals.length > 0 && (
        <div className="hospital-list">
          <h3>Hospitals List</h3>
          <table className="hospital-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Hospital Name</th>
                <th>Address</th>
                <th>Ph.No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.map((h, idx) => (
                <tr key={h.id}>
                  <td>{idx + 1}</td>
                  <td>{h.name}</td>
                  <td>{h.address}</td>
                  <td>{h.phone}</td>
                  <td>
                    <button
                      className="btn-borrow"
                      onClick={() => handleBorrow(h.id)}
                      title="Send Borrow Request"
                    >
                      Borrow
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowRequest;
