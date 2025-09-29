import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./IncomingBorrowRequest.css";

const IncomingBorrowRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    fetch(`http://localhost:3001/api/incoming_requests/${hospitalId}`)
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error("Error fetching incoming requests:", err));
  };

  const handleApprove = (id) => {
    const dueDate = prompt("Enter due date (YYYY-MM-DD):");
    if (!dueDate) return;
    fetch(`http://localhost:3001/api/borrow_requests/${id}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ due_date: dueDate }),
    })
      .then((res) => res.json())
      .then(() => fetchRequests())
      .catch((err) => console.error("Error approving request:", err));
  };

  const handleReject = (id) => {
    fetch(`http://localhost:3001/api/borrow_requests/${id}/reject`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then(() => fetchRequests())
      .catch((err) => console.error("Error rejecting request:", err));
  };

  const filteredRequests = requests.filter((req) =>
    Object.values(req).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const sortedRequests = React.useMemo(() => {
    let sorted = [...filteredRequests];
    // 1️⃣ Put pending requests at the top
    sorted.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    });
    // 2️⃣ Apply column sorting if selected
    if (sortConfig.key) {
      sorted = sorted.sort((a, b) => {
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
    }
    return sorted;
  }, [filteredRequests, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  return (
    <div className="incoming-requests-page">
      <header className="page-header">
        <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
        <h1>Incoming Borrow Requests</h1>
      </header>
      <input
        type="text"
        placeholder="🔍 Filter requests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />
      <div className="table-wrapper">
        <table className="request-table">
          <thead>
            <tr>
              <th onClick={() => requestSort("request_id")}>
                S.No{getSortIndicator("request_id")}
              </th>
              <th onClick={() => requestSort("hospital_name")}>
                Hospital Name{getSortIndicator("hospital_name")}
              </th>
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
                <tr
                  key={req.request_id}
                  className={req.status === "pending" ? "pending-row" : ""}
                >
                  <td>{idx + 1}</td>
                  <td>{req.hospital_name}</td>
                  <td>{req.resource_type}</td>
                  <td>{req.quantity}</td>
                  <td className={`urgency ${req.urgency_level?.toLowerCase()}`}>
                    {req.urgency_level}
                  </td>
                  <td>
                    {req.requested_at
                      ? (
                        <>
                          {req.requested_at.split(" ")[0]}<br />
                          {req.requested_at.split(" ")[1]}
                        </>
                      )
                      : "-"}
                  </td>
                  <td>
                    {req.updated_at
                      ? (
                        <>
                          {req.updated_at.split(" ")[0]}<br />
                          {req.updated_at.split(" ")[1]}
                        </>
                      )
                      : "-"}
                  </td>

                  <td>
                    {req.status === "pending" ? (
                      <div className="action-buttons">
                        <button
                          className="btn-accept"
                          onClick={() => handleApprove(req.request_id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(req.request_id)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`status ${req.status?.toLowerCase()}`}>
                        {req.status}
                      </span>
                    )}
                  </td>
                  <td>{req.due_date || "-"}</td>
                  <td>
                    {req.returned_at
                      ? (
                        <>
                          {req.returned_at.split(" ")[0]}<br />
                          {req.returned_at.split(" ")[1]}
                        </>
                      )
                      : "-"}
                  </td>
                  <td>{req.return_status || "-"}</td>
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
    </div>
  );
};

export default IncomingBorrowRequest;