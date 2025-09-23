import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import "./NearbyHospitals.css";

const containerStyle = {
  width: "90%",
  height: "500px",
  borderRadius: "12px"
};

const center = {
  lat: 13.0827, // Example: Chennai latitude
  lng: 80.2707  // Example: Chennai longitude
};

const NearbyHospitals = () => {
  const navigate = useNavigate();

  return (
    <div className="nearby-hospitals-page">
      <div className="map-page-header">
        <IoArrowBack className="map-back-icon" onClick={() => navigate(-1)} />
        <h1>Nearby Hospitals</h1>
      </div>

      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
          {/* You can later add hospital markers here */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default NearbyHospitals;
