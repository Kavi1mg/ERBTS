import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./IncomingBorrowRequest.css";

const IncomingBorrowRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

  const sortedRequests = React.useMemo(() => {
    if (sortConfig.key) {
      const sorted = [...filteredRequests].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (typeof aVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
      });
      return sorted;
    }
    return filteredRequests;
  }, [filteredRequests, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleInputChange = (idx, field, value) => {
    const newRequests = [...requests];
    newRequests[idx][field] = value;
    setRequests(newRequests);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  return (
    <div className="incoming-requests-page">
      <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />

      <header className="page-header">
        <h1>Incoming Borrow Requests</h1>
      </header>

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
            <th onClick={() => requestSort("request_id")}>
              S.No{getSortIndicator("request_id")}
            </th>
            {/* Removed Hospital Name */}
            <th onClick={() => requestSort("resource_type")}>
              Resource Type{getSortIndicator("resource_type")}
            </th>
            <th onClick={() => requestSort("quantity")}>
              Quantity{getSortIndicator("quantity")}
            </th>
            <th onClick={() => requestSort("urgency_level")}>
              Urgency Level{getSortIndicator("urgency_level")}
            </th>
            <th onClick={() => requestSort("requested_at")}>
              Requested At{getSortIndicator("requested_at")}
            </th>
            <th onClick={() => requestSort("updated_at")}>
              Updated At{getSortIndicator("updated_at")}
            </th>
            <th onClick={() => requestSort("status")}>
              Status / Action{getSortIndicator("status")}
            </th>
            <th onClick={() => requestSort("due_date")}>
              Due Date{getSortIndicator("due_date")}
            </th>
            <th onClick={() => requestSort("returned_at")}>
              Returned At{getSortIndicator("returned_at")}
            </th>
            <th onClick={() => requestSort("return_status")}>
              Return Status{getSortIndicator("return_status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRequests.length > 0 ? (
            sortedRequests.map((req, idx) => (
              <tr key={req.request_id}>
                <td>{idx + 1}</td>
                {/* Removed Hospital Name Cell */}
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
              <td colSpan="10">No requests found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IncomingBorrowRequest;
