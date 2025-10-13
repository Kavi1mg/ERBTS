import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import "./ManageHospitals.css";

function ManageHospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("http://localhost:3001/api/hospitals/details");

        const hospitalArray = Array.isArray(response.data)
          ? response.data
          : Object.values(response.data);

        if (hospitalArray.length > 0) {
          const keys = Object.keys(hospitalArray[0]).filter(
            (key) => key.toLowerCase() !== "password"
          );
          setColumns(keys);
        }

        setHospitals(hospitalArray);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="manage-hospital-page">
      <header className="manage-hospital-header">
        <IoArrowBack className="manage-hospital-back-icon" onClick={() => navigate(-1)} />
        <h1 className="manage-hospital-title">Manage Hospitals</h1>
      </header>

        <table className="manage-hospital-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hospitals.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>Loading hospital details...</td>
              </tr>
            ) : (
              hospitals.map((hospital, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col}>{hospital[col] ?? "-"}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );
}

export default ManageHospitals;
