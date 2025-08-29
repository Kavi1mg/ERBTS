import { useEffect, useState } from "react";

function Prediction() {
  const [predictions, setPredictions] = useState(null);
  const [date, setDate] = useState("");
  const [hospital, setHospital] = useState(""); // will be set from API

  useEffect(() => {
    // Call Flask API
    fetch("http://localhost:5000/predict") // Flask backend running on port 5000
      .then(res => res.json())
      .then(data => {
        setPredictions(data.predictions);
        setDate(data.date);
        setHospital(data.hospitalId);
      })
      .catch(err => console.error("Error fetching predictions:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Hospital Resource Predictions</h1>

      {hospital && <h3>Hospital: {hospital}</h3>}

      {predictions ? (
        <div>
          <h3>Predicted demand for {date}:</h3>
          <table border="1" cellPadding="10">
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
        <p>Loading predictions...</p>
      )}
    </div>
  );
}

export default Prediction;
