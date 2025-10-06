import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import './NearbyHospitals.css';

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

// Fit map bounds around all hospitals
const FitMapBounds = ({ hospitals }) => {
  const map = useMap();
  useEffect(() => {
    const validHospitals = hospitals.filter(h => h.lat && h.lng);
    if (validHospitals.length > 0) {
      const bounds = validHospitals.map((h) => [h.lat, h.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [hospitals, map]);
  return null;
};

// Generate random Indian-like phone number starting with 9,8,7,6
const generateRandomPhone = () => {
  const startDigits = ["9", "8", "7", "6"];
  const firstDigit = startDigits[Math.floor(Math.random() * startDigits.length)];
  let number = firstDigit;
  for (let i = 0; i < 9; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
};

const NearbyHospitals = () => {
  const [data, setData] = useState(null);
  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    if (!hospitalId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/nearby-hospitals-map/${hospitalId}`
        );
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching hospital data:", err);
      }
    };

    fetchData();
  }, [hospitalId]);

  if (!data) return <p>Loading hospitals...</p>;

  const { currentHospital, nearbyHospitals } = data;
  const allHospitals = [currentHospital, ...nearbyHospitals];

  return (
    <div className="nearby-hospitals-container">
      {/* Map */}
      <div className="hospital-map">
        <MapContainer
          center={[currentHospital.lat, currentHospital.lng]}
          zoom={13}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Current Hospital */}
          <Marker position={[currentHospital.lat, currentHospital.lng]}>
            <Popup>
              <b>{currentHospital.name}</b>
              <br />
              {currentHospital.address}
              <br />
              Phone: {currentHospital.contact || generateRandomPhone()}
              <br />
              Email: {currentHospital.email || "-"}
            </Popup>
          </Marker>

          {/* Nearby Hospitals */}
          {nearbyHospitals.map((h) =>
            h.lat && h.lng ? (
              <Marker key={h.hospitalId} position={[h.lat, h.lng]}>
                <Popup>
                  <b>{h.name}</b>
                  <br />
                  {h.address}
                  <br />
                  Phone: {h.contact || generateRandomPhone()}
                  <br />
                  Email: {h.email || "-"}
                </Popup>
              </Marker>
            ) : null
          )}

          <FitMapBounds hospitals={allHospitals} />
        </MapContainer>
      </div>

      {/* Hospital Table */}
      {/* <h2>Hospital Details</h2> */}
      {/* Hospital Table */}
<table className="hospital-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Address</th>
      <th>Phone</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    {nearbyHospitals.map((h) => (
      <tr key={h.hospitalId}>
        <td>{h.name}</td>
        <td>{h.address}</td>
        <td>{h.contact || generateRandomPhone()}</td>
        <td>{h.email || "-"}</td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
};

export default NearbyHospitals;


