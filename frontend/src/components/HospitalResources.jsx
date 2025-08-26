import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5"; // import back icon
import { useNavigate } from "react-router-dom"; // for navigation
import "./HospitalResources.css";

const HospitalResources = () => {
  const [resources, setResources] = useState([]);
  const [hospitals, setHospitals] = useState({});
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="hospital-resources-page">Loading...</div>;

  return (
    <div className="hospital-resources-page">
      <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
      <h2>Hospital Resources</h2>
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
          {resources.map((res, idx) => (
            <tr key={`${res.hospitalId}-${res.resource_type}`}>
              <td>{idx + 1}</td>
              <td>{hospitals[res.hospitalId]}</td>
              <td>{res.resource_type}</td>
              <td>{res.total_quantity}</td>
              <td>{res.available}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HospitalResources;
