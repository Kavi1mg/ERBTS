// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";

// function AdminDashboard() {
//   const [pendingHospitals, setPendingHospitals] = useState([]);

//   // ✅ Load pending hospitals
//   useEffect(() => {
//     fetchPendingHospitals();
//   }, []);

//   const fetchPendingHospitals = async () => {
//     try {
//       const res = await axios.get("http://localhost:3001/pending-hospitals");
//       setPendingHospitals(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const approveHospital = async (hospitalId) => {
//     try {
//       await axios.put(`http://localhost:3001/approve/${hospitalId}`);
//       alert("Hospital approved!");
//       fetchPendingHospitals();
//     } catch (err) {
//       console.error(err);
//       alert("Approval failed!");
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2>Admin Dashboard</h2>
//       <h4>Pending Hospital Registrations</h4>
//       {pendingHospitals.length === 0 ? (
//         <p>No pending hospitals.</p>
//       ) : (
//         <table className="table table-bordered">
//           <thead>
//             <tr>
//               <th>Hospital ID</th>
//               <th>Name</th>
//               <th>Email</th>
//               <th>District</th>
//               <th>State</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {pendingHospitals.map((h) => (
//               <tr key={h.hospitalId}>
//                 <td>{h.hospitalId}</td>
//                 <td>{h.name}</td>
//                 <td>{h.email}</td>
//                 <td>{h.district}</td>
//                 <td>{h.state}</td>
//                 <td>
//                   <button
//                     className="btn btn-success btn-sm"
//                     onClick={() => approveHospital(h.hospitalId)}
//                   >
//                     Approve
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export default AdminDashboard;
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import "./AdminDashboard.css";

function AdminDashboard() {
  const [hospitals, setHospitals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // fetch hospitals pending approval
    const fetchHospitals = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/hospitals");
        setHospitals(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHospitals();
  }, []);

  const handleApprove = async (hospitalId) => {
    try {
      await axios.put(`http://localhost:3001/api/approve/${hospitalId}`);
      setHospitals(hospitals.map(h => 
        h.hospitalId === hospitalId ? { ...h, isApproved: 1 } : h
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Hospital ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          {hospitals.map((h) => (
            <tr key={h.hospitalId}>
              <td>{h.hospitalId}</td>
              <td>{h.name}</td>
              <td>{h.email}</td>
              <td>
                {h.isApproved ? (
                  "Approved"
                ) : (
                  <button onClick={() => handleApprove(h.hospitalId)}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate("/")}>Logout</button>
    </div>
  );
}

export default AdminDashboard;
