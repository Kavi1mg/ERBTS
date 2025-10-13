// // import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { IoArrowBack } from "react-icons/io5";
// // import axios from "axios";
// // import "./ManageHospitals.css";

// // function ManageHospitals() {
// //   const navigate = useNavigate();
// //   const [hospitals, setHospitals] = useState([]);
// //   const [hospitalDetails, setHospitalDetails] = useState({});

// //   useEffect(() => {
// //     async function fetchData() {
// //       try {
// //         const hResponse = await axios.get("http://localhost:3001/hospitals");
// //         const hospitalArray = Object.entries(hResponse.data).map(([id, name]) => ({ hospitalId: id, name }));

// //         // Initialize details
// //         const details = {};

// //         for (const hospital of hospitalArray) {
// //           const [borrowRes, incomingRes, resourceRes] = await Promise.all([
// //             axios.get(`http://localhost:3001/api/borrow_requests/${hospital.hospitalId}`),
// //             axios.get(`http://localhost:3001/api/incoming_requests/${hospital.hospitalId}`),
// //             axios.get(`http://localhost:3001/api/resources/${hospital.hospitalId}`)
// //           ]);

// //           details[hospital.hospitalId] = {
// //             borrowRequestsMade: borrowRes.data.length,
// //             requestsReceived: incomingRes.data.length,
// //             availableResources: resourceRes.data.reduce((acc, cur) => acc + (cur.available || 0), 0)
// //           };
// //         }
// //         setHospitals(hospitalArray);
// //         setHospitalDetails(details);
// //       } catch (err) {
// //         console.error(err);
// //       }
// //     }
// //     fetchData();
// //   }, []);

// //   return (
// //     <div className="manage-hospitals-page">
// //       <header className="page-header">
// //         <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
// //         <h1>Manage Hospitals</h1>
// //       </header>

// //       <div className="table-wrapper">
// //         <table className="hospitals-table">
// //           <thead>
// //             <tr>
// //               <th>Hospital Name</th>
// //               <th>Borrow Requests Made</th>
// //               <th>Requests Received</th>
// //               <th>Available Resources</th>
// //               <th>Location</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {hospitals.length === 0 && (
// //               <tr>
// //                 <td colSpan="5">Loading hospitals...</td>
// //               </tr>
// //             )}
// //             {hospitals.map(h => {
// //               const details = hospitalDetails[h.hospitalId] || {};
// //               return (
// //                 <tr key={h.hospitalId}>
// //                   <td>{h.name}</td>
// //                   <td>{details.borrowRequestsMade ?? "-"}</td>
// //                   <td>{details.requestsReceived ?? "-"}</td>
// //                   <td>{details.availableResources ?? "-"}</td>
// //                   <td>
// //                     {/* Location can be added if you want - for now just 'See on map' text*/}
// //                     <button onClick={() => alert('Map feature coming soon!')}>
// //                       View Location
// //                     </button>
// //                   </td>
// //                 </tr>
// //               );
// //             })}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ManageHospitals;
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IoArrowBack } from "react-icons/io5";
// import axios from "axios";
// import "./ManageHospitals.css";

// function ManageHospitals() {
//   const navigate = useNavigate();
//   const [hospitals, setHospitals] = useState([]);
//   const [columns, setColumns] = useState([]);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const response = await axios.get("http://localhost:3001/hospitals");

//         // Convert object data (if necessary) to array
//         const hospitalArray = Array.isArray(response.data)
//           ? response.data
//           : Object.values(response.data);

//         // Automatically extract column names except "password"
//         if (hospitalArray.length > 0) {
//           const keys = Object.keys(hospitalArray[0]).filter(
//             (key) => key.toLowerCase() !== "password"
//           );
//           setColumns(keys);
//         }

//         setHospitals(hospitalArray);
//       } catch (err) {
//         console.error("Error fetching hospitals:", err);
//       }
//     }

//     fetchData();
//   }, []);

//   return (
//     <div className="manage-hospitals-page">
//       <header className="page-header">
//         <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
//         <h1>Manage Hospitals</h1>
//       </header>

//       <div className="table-wrapper">
//         <table className="hospitals-table">
//           <thead>
//             <tr>
//               {columns.map((col) => (
//                 <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {hospitals.length === 0 ? (
//               <tr>
//                 <td colSpan={columns.length}>Loading hospital details...</td>
//               </tr>
//             ) : (
//               hospitals.map((hospital, index) => (
//                 <tr key={index}>
//                   {columns.map((col) => (
//                     <td key={col}>{hospital[col] ?? "-"}</td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default ManageHospitals;
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
        // Updated API endpoint
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
    <div className="manage-hospitals-page">
      <header className="page-header">
        <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
        <h1>Manage Hospitals</h1>
      </header>

      <div className="table-wrapper">
        <table className="hospitals-table">
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
    </div>
  );
}

export default ManageHospitals;
