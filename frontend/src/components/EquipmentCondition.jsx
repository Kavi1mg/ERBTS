import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./EquipmentCondition.css";

const EquipmentCondition = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const hospitalId = localStorage.getItem("hospitalId");
  const role = localStorage.getItem("role"); // 👈 check if admin or hospital

  useEffect(() => {
    const hospitalId = localStorage.getItem("hospitalId");
    if (!hospitalId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/equipment/${hospitalId}`);
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("Error fetching equipment records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Filtered records based on search input:
  const filteredRecords = records.filter((r) => {
    const lowerSearch = search.toLowerCase();
    return (
      r.hospitalId.toLowerCase().includes(lowerSearch) ||
      r.resourceType.toLowerCase().includes(lowerSearch) ||
      (r.notes && r.notes.toLowerCase().includes(lowerSearch))
    );
  });

  if (loading) return <div className="equipment-condition-page">Loading...</div>;

  return (
    <div className="equipment-condition-page">
      <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
      <header className="page-header">
        <h1>Equipment Conditions</h1>
      </header>
      <input
        type="text"
        placeholder="🔍 Filter equipment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />
      <table className="equipment-table">
        <thead>
          <tr>
            <th>Id</th>
            {role === "admin" && <th>Hospital ID</th>} {/* show hospital for admin */}
            <th>Resource Type</th>
            <th>Last Serviced</th>
            <th>Next Service Due</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                {role === "admin" && <td>{r.hospitalId}</td>}
                <td>{r.resourceType}</td>
                <td>{r.lastServiced}</td>
                <td>{r.nextServiceDue}</td>
                <td>{r.notes}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={role === "admin" ? 6 : 5}>No matching records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentCondition;
