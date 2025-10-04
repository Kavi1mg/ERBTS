// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import axios from "axios";

// // Fix default Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
// });

// const NearbyHospitals = () => {
//   const [data, setData] = useState(null);

//   // get hospitalId from localStorage after login
//   const hospitalId = localStorage.getItem("hospitalId");

//   useEffect(() => {
//     if (!hospitalId) return;

//     axios
//       .get(`http://localhost:3001/api/nearby-hospitals-map/${hospitalId}`)
//       .then((res) => {
//       console.log("API Response:", res.data); // 👈 log everything
//       setData(res.data);
//     })
//       .catch((err) => console.error(err));
//   }, [hospitalId]);

//   if (!data) return <p>Loading map...</p>;

//   return (
//     <MapContainer
//       center={[data.center.lat, data.center.lng]}
//       zoom={12}
//       style={{ height: "500px", width: "100%" }}
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />

//       {/* Current hospital */}
//       {/* <Marker position={[data.currentHospital.lat, data.currentHospital.lng]}>
//         <Popup>
//           <strong>{data.currentHospital.name}</strong>
//           <br />
//           {data.currentHospital.address}
//         </Popup>
//       </Marker> */}
//       <Marker position={[data.center.lat, data.center.lng]}>
//   <Popup>
//     <strong>{data.currentHospital.name}</strong><br />
//     {data.currentHospital.address}
//   </Popup>
// </Marker>

//       {/* Nearby hospitals */}
//       {data.nearbyHospitals.map((h) => (
//         <Marker key={h.hospitalId} position={[h.lat, h.lng]}>
//           <Popup>
//             <strong>{h.name}</strong>
//             <br />
//             {h.address}
//           </Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// };

// export default NearbyHospitals;

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

const NearbyHospitals = () => {
  const [data, setData] = useState(null);

  // Get hospitalId from localStorage after login
  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    if (!hospitalId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/nearby-hospitals-map/${hospitalId}`
        );
        const result = await response.json();
        console.log("API Response:", result);
        setData(result);
      } catch (err) {
        console.error("Error fetching nearby hospitals:", err);
      }
    };

    fetchData();
  }, [hospitalId]);

  // Loading check
  if (!data || !data.currentHospital || !data.nearbyHospitals) {
    return <p>Loading nearby hospitals...</p>;
  }

  const { center, currentHospital, nearbyHospitals } = data;

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[Number(center.lat), Number(center.lng)]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Current hospital marker */}
        <Marker
          position={[Number(currentHospital.lat), Number(currentHospital.lng)]}
        >
          <Popup>
            <b>{currentHospital.name}</b>
            <br />
            {currentHospital.address}
          </Popup>
        </Marker>

        {/* Nearby hospitals */}
        {nearbyHospitals.map((h) =>
          h.lat && h.lng ? (
            <Marker key={h.hospitalId} position={[Number(h.lat), Number(h.lng)]}>
              <Popup>
                <b>{h.name}</b>
                <br />
                {h.address}
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default NearbyHospitals;
