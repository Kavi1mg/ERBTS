import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loggedInHospitalId, setLoggedInHospitalId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get logged-in hospital ID
    axios.get("http://localhost:3001/api/auth/me", { withCredentials: true })
      .then(res => setLoggedInHospitalId(res.data.hospitalId))
      .catch(() => setLoggedInHospitalId(""));

    // Fetch all hospitals
    axios.get("http://localhost:3001/api/hospitals")
      .then(res => setHospitals(res.data))
      .catch(() => setHospitals([]));
  }, []);

  // Filter out logged-in hospital
  const filteredHospitals = hospitals.filter(h => h.hospitalId !== loggedInHospitalId);

  const handleBorrowClick = (hospitalId) => {
    navigate("/borrow-request-form", { state: { fromHospitalId: hospitalId } });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hospital List Page</h1>
      <h2>Available Hospitals</h2>
      {filteredHospitals.length === 0 ? (
        <p>No other hospitals available to borrow from.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Hospital Name</th>
              <th>District</th>
              <th>State</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHospitals.map(hospital => (
              <tr key={hospital.hospitalId}>
                <td>{hospital.name}</td>
                <td>{hospital.district}</td>
                <td>{hospital.state}</td>
                <td>{hospital.phone_number}</td>
                <td>
                  <button onClick={() => handleBorrowClick(hospital.hospitalId)}>
                    Borrow from this Hospital
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HospitalList;
