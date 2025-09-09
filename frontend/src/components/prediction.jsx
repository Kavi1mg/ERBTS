// import { useEffect, useState } from "react";
// import { IoArrowBack } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import './prediction.css';

// function Prediction() {
//   const navigate = useNavigate();

//   const [predictions, setPredictions] = useState(null);
//   const [date, setDate] = useState("");
//   const [hospital, setHospital] = useState("");

//   useEffect(() => {
//     fetch("http://localhost:5000/predict")
//       .then(res => res.json())
//       .then(data => {
//         setPredictions(data.predictions);
//         setDate(data.date);
//         setHospital(data.hospitalId);
//       })
//       .catch(err => console.error("Error fetching predictions:", err));
//   }, []);

//   return (
//     <div className="prediction-page">
//       {/* Back Icon */}
//       <IoArrowBack
//         className="back-icon"
//         onClick={() => navigate(-1)}
//         title="Go Back"
//       />

//       {/* Stylish Page Header */}
//       <header className="page-header">
//         <h1>Hospital Resource Predictions</h1>
//       </header>

//       {/* Content Container to move content below header */}
//       <div className="content-container">
//         {hospital && <h3>Hospital: {hospital}</h3>}

//         {predictions ? (
//           <div>
//             <h3>Predicted demand for {date}:</h3>
//             <table className="prediction-table" border="1" cellPadding="10">
//               <thead>
//                 <tr>
//                   <th>Resource Type</th>
//                   <th>Quantity</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(predictions).map(([resource, quantity]) => (
//                   <tr key={resource}>
//                     <td>{resource}</td>
//                     <td>{quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="loading-message">Loading predictions...</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Prediction;













import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import './prediction.css';

function Prediction() {
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState(null);
  const [date, setDate] = useState("");
  const [hospital, setHospital] = useState("");

  useEffect(() => {
    // Get hospitalId from localStorage after login
    const hospitalId = localStorage.getItem("hospitalId");
    if (!hospitalId) {
      console.error("No hospitalId found. Please login.");
      navigate("/login");
      return;
    }

    // Fetch predictions from Flask API for the logged-in hospital
    fetch(`http://localhost:5000/predict?hospitalId=${hospitalId}`)
      .then(res => res.json())
      .then(data => {
        setPredictions(data.predictions);
        setDate(data.date);
        setHospital(data.hospitalId);
      })
      .catch(err => console.error("Error fetching predictions:", err));
  }, [navigate]);

  return (
    <div className="prediction-page">
      <IoArrowBack
        className="back-icon"
        onClick={() => navigate(-1)}
        title="Go Back"
      />

      <header className="page-header">
        <h1>Hospital Resource Predictions</h1>
      </header>

      <div className="content-container">
        {hospital && <h3>Hospital: {hospital}</h3>}

        {predictions ? (
          <div>
            <h3>Predicted demand for {date}:</h3>
            <table className="prediction-table" border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Resource Type</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(predictions).map(([resource, quantity]) => (
                  <tr key={resource}>
                    <td>{resource}</td>
                    <td>{quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="loading-message">Loading predictions...</p>
        )}
      </div>
    </div>
  );
}

export default Prediction;
