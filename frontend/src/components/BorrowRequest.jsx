import React, { useState } from "react";
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

  const [borrowRequests, setBorrowRequests] = useState([
    {
      id: 1,
      toHospitalId: "DL_AIIMS",
      resourceType: "ICU Beds",
      quantity: 10,
      urgency_level: "High",
      status: "pending",
      requestedAt: "2025-08-25",
      updatedAt: "2025-08-25",
      due_date: "2025-09-01",
      returned_at: null,
      return_status: "not_returned",
    },
    {
      id: 2,
      toHospitalId: "TN_CMC",
      resourceType: "Ventilators",
      quantity: 5,
      urgency_level: "Medium",
      status: "approved",
      requestedAt: "2025-08-24",
      updatedAt: "2025-08-25",
      due_date: "2025-08-30",
      returned_at: "2025-08-26",
      return_status: "returned",
    },
  ]);

  const [hospitalList, setHospitalList] = useState([
    { id: 1, name: "MH_KEM", address: "Mumbai, MH", phone: "022-123456" },
    { id: 2, name: "PB_PGI", address: "Chandigarh, PB", phone: "0172-654321" },
  ]);

  const [filteredHospitals, setFilteredHospitals] = useState([]);

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
      id: borrowRequests.length + 1,
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

    setBorrowRequests([...borrowRequests, newRequest]);
    setResourceType("");
    setQuantity("");
    setUrgencyLevel("");
    setShowForm(false);
    setFilteredHospitals(hospitalList);
  };

  const handleReturn = (id) => {
    const updated = borrowRequests.map((req) =>
      req.id === id
        ? {
            ...req,
            return_status: "returned",
            returned_at: new Date().toISOString().split("T")[0],
          }
        : req
    );
    setBorrowRequests(updated);
  };

  const handleBorrow = (hospitalId) => {
    alert(`Borrow request sent to hospital ID: ${hospitalId}`);
  };

  return (
    <div className="borrow-request-page">
      <IoArrowBack
        className="back-icon"
        onClick={() => navigate(-1)}
        title="Go Back"
      />
      
      <header className="page-header">
        <h1>Incoming Borrow Requests</h1>
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
              <td>{req.toHospitalId}</td>
              <td>
                {iconForResourceType(req.resourceType)} {req.resourceType}
              </td>
              <td>{req.quantity}</td>
              <td className={`urgency ${req.urgency_level.toLowerCase()}`}>
                {req.urgency_level}
              </td>
              <td>{req.requestedAt}</td>
              <td>{req.updatedAt}</td>
              <td className={`status ${req.status.toLowerCase()}`}>{req.status}</td>
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
