import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./IncomingBorrowRequest.css";

const IncomingBorrowRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/incoming_requests")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error("Error fetching incoming requests:", err));
  }, []);

  const filteredRequests = requests.filter((req) =>
    Object.values(req).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleInputChange = (idx, field, value) => {
    const newRequests = [...requests];
    newRequests[idx][field] = value;
    setRequests(newRequests);
  };

  return (
    <div className="incoming-requests-page">
      <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
      <h2>Incoming Borrow Requests</h2>

      <input
        type="text"
        placeholder="🔍 Filter requests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />

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
            <th>Status / Action</th>
            <th>Due Date</th>
            <th>Returned At</th>
            <th>Return Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req, idx) => (
              <tr key={req.request_id}>
                <td>{idx + 1}</td>
                <td>{req.hospital_name}</td>
                <td>{req.resource_type}</td>
                <td>{req.quantity}</td>
                <td className={`urgency ${req.urgency_level?.toLowerCase()}`}>
                  {req.urgency_level}
                </td>
                <td>{req.requested_at}</td>
                <td>{req.updated_at}</td>
                <td>
                  {req.status === "Pending" ? (
                    <div className="action-buttons">
                      <button className="btn-accept">Accept</button>
                      <button className="btn-reject">Reject</button>
                    </div>
                  ) : (
                    <span className={`status ${req.status?.toLowerCase()}`}>
                      {req.status}
                    </span>
                  )}
                </td>
                <td>
                  {req.status === "Approved" ? (
                    <input
                      type="date"
                      value={req.due_date || ""}
                      onChange={(e) =>
                        handleInputChange(idx, "due_date", e.target.value)
                      }
                    />
                  ) : (
                    req.due_date || "-"
                  )}
                </td>
                <td>
                  <input
                    type="date"
                    value={req.returned_at || ""}
                    onChange={(e) =>
                      handleInputChange(idx, "returned_at", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={req.return_status || ""}
                    onChange={(e) =>
                      handleInputChange(idx, "return_status", e.target.value)
                    }
                    placeholder="Enter status"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11">No requests found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IncomingBorrowRequest;
