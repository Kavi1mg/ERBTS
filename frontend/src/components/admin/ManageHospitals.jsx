import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./ManageHospitals.css";

function ManageHospitals() {
  const navigate = useNavigate();

  return (
    <div className="manage-hospitals-page">
      <header className="page-header">
        <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
        <h1>Manage Hospitals</h1>
      </header>

      <div className="table-wrapper">
        <table className="hospitals-table">
          <thead>
            <tr>
              <th>Hospital Name</th>
              <th>Borrow Requests Made</th>
              <th>Requests Received</th>
              <th>Available Resources</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {/* Empty table body */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageHospitals;
