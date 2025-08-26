import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./HospitalResources.css";

const HospitalResources = () => {
  const [resources, setResources] = useState([]);
  const [hospitals, setHospitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");     // added search state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/resources");
        const resourcesData = await res.json();

        const hosRes = await fetch("http://localhost:5000/hospitals");
        const hospitalsData = await hosRes.json();

        setResources(resourcesData);
        setHospitals(hospitalsData);
      } catch (err) {
        console.error("Error fetching hospital resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter resources based on search input across hospital name and resource type
  const filteredResources = resources.filter((res) => {
    const hospitalName = hospitals[res.hospitalId] || "";
    const lowerSearch = search.toLowerCase();
    return (
      hospitalName.toLowerCase().includes(lowerSearch) ||
      res.resource_type.toLowerCase().includes(lowerSearch)
    );
  });

  if (loading) return <div className="hospital-resources-page">Loading...</div>;

  return (
    <div className="hospital-resources-page">
      <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
      <header className="page-header">
        <h1>Hospital Resources</h1>
      </header>
      <input
        type="text"
        placeholder="🔍 Filter requests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />
      <table className="hospital-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Hospital Name</th>
            <th>Resource Type</th>
            <th>Total Quantity</th>
            <th>Available</th>
          </tr>
        </thead>
        <tbody>
          {filteredResources.map((res, idx) => (
            <tr key={`${res.hospitalId}-${res.resource_type}`}>
              <td>{idx + 1}</td>
              <td>{hospitals[res.hospitalId] || "Unknown"}</td>
              <td>{res.resource_type}</td>
              <td>{res.total_quantity}</td>
              <td>{res.available}</td>
            </tr>
          ))}
          {filteredResources.length === 0 && (
            <tr>
              <td colSpan="5">No resources found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HospitalResources;
