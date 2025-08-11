import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function BorrowRequestForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hospital to borrow from
  const fromHospitalId = location.state?.fromHospitalId || "";

  // Logged-in hospital (toHospitalId)
  const [toHospitalId, setToHospitalId] = useState("");

  // Resources available in fromHospital
  const [availableResources, setAvailableResources] = useState([]);

  // Form state
  const [form, setForm] = useState({
    resourceType: "",
    quantity: "",
    reason: ""
  });

  useEffect(() => {
    // Get logged-in hospital id
    axios.get("http://localhost:3001/api/auth/me", { withCredentials: true })
      .then(res => setToHospitalId(res.data.hospitalId))
      .catch(() => {
        alert("Please log in first.");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    if (!fromHospitalId) return;

    // Fetch resources of the hospital to borrow from
    axios.get(`http://localhost:3001/api/resources/${fromHospitalId}`)
      .then(res => setAvailableResources(res.data))
      .catch(() => setAvailableResources([]));
  }, [fromHospitalId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResourceChange = (e) => {
    setForm({ ...form, resourceType: e.target.value, quantity: "" });
  };

  const maxQuantity = availableResources.find(r => r.type === form.resourceType)?.quantity || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toHospitalId) {
      alert("You are not logged in.");
      return;
    }
    if (!fromHospitalId) {
      alert("No hospital selected to borrow from.");
      return;
    }
    if (!form.resourceType) {
      alert("Please select a resource type.");
      return;
    }
    if (parseInt(form.quantity) <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }
    if (parseInt(form.quantity) > maxQuantity) {
      alert(`Quantity can't be more than available (${maxQuantity}).`);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/borrow/request", {
        fromHospitalId,
        toHospitalId,
        resourceType: form.resourceType,
        quantity: form.quantity,
        reason: form.reason
      });
      alert(`Borrow request submitted to Hospital ${fromHospitalId}!`);
      navigate("/hospitals");
    } catch (err) {
      alert(err.response?.data?.error || "Error submitting request");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Borrow Request Form</h2>
      <p>Borrowing from Hospital ID: <b>{fromHospitalId}</b></p>

      <h3>Available Resources at this Hospital:</h3>
      {availableResources.length === 0 ? (
        <p>No resources available.</p>
      ) : (
        <ul>
          {availableResources.map(res => (
            <li key={res.type}>{res.type}: {res.quantity}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label>Resource Type:</label>
        <select name="resourceType" value={form.resourceType} onChange={handleResourceChange} required>
          <option value="">-- Select Resource --</option>
          {availableResources.map(res => (
            <option key={res.type} value={res.type}>{res.type} (Available: {res.quantity})</option>
          ))}
        </select>

        <label>Quantity (max {maxQuantity}):</label>
        <input
          type="number"
          name="quantity"
          min="1"
          max={maxQuantity}
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <label>Reason:</label>
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Optional"
        ></textarea>

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}
