import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./EquipmentCondition.css";

const EquipmentCondition = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const hospitals = {
    'DL_AIIMS': 'AIIMS Delhi',
    'MH_KEM': 'KEM Mumbai',
    'TN_CMC': 'CMC Tamil Nadu',
    'PB_PGI': 'PGI Punjab',
    'KA_NIMHANS': 'NIMHANS Karnataka',
    'UP_SGPGIMS': 'SGPGIMS Lucknow',
    'RJ_SMS': 'SMS Jaipur',
    'GJ_Civil': 'Civil Hospital Ahmedabad',
    'WB_CMCH': 'CMCH Kolkata',
    'KL_MCH': 'MCH Kerala'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/equipment-tracking");
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

  if (loading) return <div className="equipment-condition-page">Loading...</div>;

  return (
    <div className="equipment-condition-page">
      <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
      <h2>Equipment Condition</h2>
      <table className="equipment-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Hospital Name</th>
            <th>Resource Type</th>
            <th>Last Serviced</th>
            <th>Next Serviced</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{hospitals[r.hospitalId]}</td>
              <td>{r.resourceType}</td>
              <td>{r.lastServiced}</td>
              <td>{r.nextServiceDue}</td>
              <td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentCondition;
