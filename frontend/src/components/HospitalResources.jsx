// import React, { useEffect, useState } from "react";
// import { IoArrowBack } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import "./HospitalResources.css";

// const HospitalResources = () => {
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const navigate = useNavigate();

//   const hospitalId = localStorage.getItem("hospitalId"); 

//   useEffect(() => {
//     const hospitalId = localStorage.getItem("hospitalId");
//     if (!hospitalId) return;

//     const fetchData = async () => {
//       try {
//         const res = await fetch(`http://localhost:3001/api/resources/${hospitalId}`);
//         const data = await res.json();
//         console.log("Fetched resources:", data); // ✅ Debug log

//         setResources(data);
//       } catch (err) {
//         console.error("Error fetching resources:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);


//   // Filter resources based on search input (only resourceType now)
//   const filteredResources = resources.filter((res) =>
//     res.resource_type.toLowerCase().includes(search.toLowerCase())
//   );

//   if (loading) return <div className="hospital-resources-page">Loading...</div>;

//   return (
//     <div className="hospital-resources-page">
//       <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
//       <header className="page-header">
//         <h1>Hospital Resources</h1>
//       </header>
//       <input
//         type="text"
//         placeholder="🔍 Filter resources..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="filter-input"
//       />
//       <table className="hospital-table">
//         <thead>
//           <tr>
//             <th>Id</th>
//             <th>Resource Type</th>
//             <th>Total Quantity</th>
//             <th>Available</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredResources.map((res, idx) => (
//            <tr key={idx}>   {/* ✅ Use index as key */}
//            <td>{idx + 1}</td>
//            <td>{res.resource_type}</td>
//            <td>{res.total_quantity}</td>
//            <td>{res.available}</td>
//            </tr>
//              ))}
//           {filteredResources.length === 0 && (
//             <tr>
//               <td colSpan="4">No resources found</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default HospitalResources;

import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./HospitalResources.css";

const HospitalResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newResourceType, setNewResourceType] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const navigate = useNavigate();

  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    if (!hospitalId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/resources/${hospitalId}`);
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hospitalId]);

  const handleAddOrUpdateResource = async () => {
    if (!newResourceType.trim() || !newQuantity.trim()) return;

    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/resources/${hospitalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resource_type: newResourceType,
          quantity: quantity
        })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Something went wrong");
        return;
      }

      // Refetch updated resources after add/update
      const res = await fetch(`http://localhost:3001/api/resources/${hospitalId}`);
      const data = await res.json();
      setResources(data);

      setShowForm(false);
      setNewResourceType("");
      setNewQuantity("");

    } catch (error) {
      console.error("Error adding/updating resource:", error);
      alert("Failed to update resource");
    }
  };

  const filteredResources = resources.filter((res) =>
    res.resource_type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="hospital-resources-page">Loading...</div>;

  return (
    <div className="hospital-resources-page">
      <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
      <header className="page-header">
        <h1>Hospital Resources</h1>
      </header>

      <input
        type="text"
        placeholder="🔍 Filter resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />

      <button onClick={() => setShowForm(true)} className="add-button">
        + Add Resource
      </button>

      {showForm && (
        <div className="form-container">
          <input
            type="text"
            placeholder="Resource Type"
            value={newResourceType}
            onChange={(e) => setNewResourceType(e.target.value)}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <button onClick={handleAddOrUpdateResource}>Submit</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <table className="hospital-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Resource Type</th>
            <th>Total Quantity</th>
            <th>Available</th>
          </tr>
        </thead>
        <tbody>
          {filteredResources.map((res, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{res.resource_type}</td>
              <td>{res.total_quantity}</td>
              <td>{res.available}</td>
            </tr>
          ))}
          {filteredResources.length === 0 && (
            <tr>
              <td colSpan="4">No resources found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HospitalResources;
