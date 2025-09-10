import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaHospital, FaAmbulance, FaProcedures, FaLungs } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./BorrowRequest.css";

const BorrowRequest = () => {
  const navigate = useNavigate();
  const hospitalId = localStorage.getItem("hospitalId");
  const [showForm, setShowForm] = useState(false);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [resourceType, setResourceType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [showHospitalsTable, setShowHospitalsTable] = useState(false);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableResourceTypes();
    fetchBorrowRequests();
  }, []);

  // Fetch dynamic resource types from backend - corrected to handle array of strings
  const fetchAvailableResourceTypes = () => {
    fetch(`http://localhost:3001/api/resources`)
      .then((res) => res.json())
      .then((data) => {
        // data is an array of strings representing resource types
        setResourceTypes(data);
      })
      .catch((err) => console.error("Error fetching resource types:", err));
  };

  const fetchBorrowRequests = () => {
    fetch(`http://localhost:3001/api/borrow_requests/${hospitalId}`)
      .then((res) => res.json())
      .then((data) => setBorrowRequests(data))
      .catch((err) => console.error("Error fetching borrow requests:", err));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!resourceType || !quantity || !urgencyLevel) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/hospitals?resourceType=${resourceType}&minQuantity=${quantity}`
      );
      const data = await res.json();

      // Remove current hospital
      const filtered = data.filter((h) => h.hospitalId !== hospitalId);

      // ✅ Remove duplicate hospitals by hospitalId
      const uniqueHospitals = Array.from(
        new Map(filtered.map((h) => [h.hospitalId, h])).values()
      );

      setFilteredHospitals(uniqueHospitals);
      setShowHospitalsTable(true);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowRequest = async (selectedHospital) => {
    setLoading(true);
    try {
      await fetch("http://localhost:3001/api/borrow_requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromHospitalId: hospitalId,
          toHospitalId: selectedHospital.hospitalId,
          resourceType,
          quantity,
          urgency_level: urgencyLevel,
        }),
      });
      setShowForm(false);
      setShowHospitalsTable(false);
      setResourceType("");
      setQuantity("");
      setUrgencyLevel("");
      setFilteredHospitals([]);
      fetchBorrowRequests();
    } catch (err) {
      console.error("Error submitting request:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle returning a borrowed resource
  const handleReturn = async (requestId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/borrow_requests/${requestId}/return`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Failed to return resource");

      const data = await res.json();
      console.log("Return response:", data);

      // Refresh borrow requests after return
      fetchBorrowRequests();
    } catch (err) {
      console.error("Error returning resource:", err);
    } finally {
      setLoading(false);
    }
  };

  const iconForResourceType = (type) => {
    switch (type.toLowerCase()) {
      case "ambulance":
        return <FaAmbulance color="#2563eb" />;
      case "ventilator":
        return <FaLungs color="#1e40af" />;
      case "oxygen cylinder":
        return <FaProcedures color="#3b82f6" />;
      case "icu bed":
      case "icu beds":
        return <FaHospital color="#2563eb" />;
      default:
        return "🩺";
    }
  };

  const handleReturn = (id) => {
    // Implement return logic here
  };

  return (
    <div className="borrow-request-page">
      <header className="page-header">
        <IoArrowBack
          className="back-icon"
          onClick={() => navigate(-1)}
          title="Go Back"
        />
        <h1>Borrow Requests</h1>
      </header>

      <div className="borrow-page-content">
        <button
          className="make-request-btn"
          onClick={() => {
            setShowForm(!showForm);
            setShowHospitalsTable(false);
            setResourceType("");
            setQuantity("");
            setUrgencyLevel("");
            setFilteredHospitals([]);
          }}
        >
          {showForm ? "Close Request Form" : "Make a Request"}
        </button>

        {/* Initial Request Form */}
        {showForm && !showHospitalsTable && (
          <form className="request-form" onSubmit={handleFormSubmit}>
            <label>
              Resource Type:
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                required
              >
                <option value="">Select</option>
                {resourceTypes.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
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
              {loading ? "Searching..." : "Submit"}
            </button>
          </form>
        )}

        {/* Hospital Selection Table */}
        {showForm && showHospitalsTable && (
          <div className="scrollable-table-region">
            <table className="hospital-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Hospital Name</th>
                  <th>Address</th>
                  <th>Phone No</th>
                  <th>Quantity Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      No hospitals found with the required quantity.
                    </td>
                  </tr>
                ) : (
                  filteredHospitals.map((hosp, idx) => (
                    <tr key={hosp.hospitalId}>
                      <td>{idx + 1}</td>
                      <td>{hosp.name}</td>
                      <td>{hosp.address}</td>
                      <td>{hosp.phone}</td>
                      <td>{hosp.quantity}</td>
                      <td>
                        <button
                          className="btn-borrow"
                          disabled={loading}
                          onClick={() => handleBorrowRequest(hosp)}
                        >
                          Borrow
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      {/* Existing Borrow Requests Table */}
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
                  <button className="btn-return" onClick={() => handleReturn(req.id)}>
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
