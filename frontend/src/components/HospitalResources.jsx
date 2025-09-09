import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./HospitalResources.css";

const HospitalResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    if (!hospitalId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/resources/${hospitalId}`);
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hospitalId]);

  const filteredResources = resources.filter((res) =>
    res.resource_type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="hospital-resources-page">Loading...</div>;

  return (
    <div className="hospital-resources-page">
      <header className="page-header">
        <IoArrowBack className="back-icon" onClick={() => navigate(-1)} title="Go Back" />
        <h1>Hospital Resources</h1>
      </header>

      <div className="hospital-page-content">
        <input
          type="text"
          placeholder="🔍 Filter resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />

        <table className="hospital-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Resource Type</th>
              <th>Total Quantity</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.length > 0 ? (
              filteredResources.map((res, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{res.resource_type}</td>
                  <td>{res.total_quantity}</td>
                  <td>{res.available}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No resources found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HospitalResources;
