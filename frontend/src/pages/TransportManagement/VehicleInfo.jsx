import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VehicleInfo.css";

// Dummy vehicle data
const dummyVehicles = [
  {
    id: "V001",
    registration: "MH12AB1234",
    model: "Bus",
    capacity: 50,
    fuelType: "Diesel",
    status: "active",
    ownership: "self-owned",
    img: "https://via.placeholder.com/150",
    yearOfManufacture: "sept 2020",
    pollutionValidUntil: "12 jan 2025",
    lastServiceDate: "15 oct 2024",
    totalKm: "5000km",
    insuranceExpiry: "2024",
    maintenanceCost: "500",
    fuelCharge: "700",
    chassisNumber: "as1234zy6789",
    engineNumber: "123456",
    color: "yellow",
    routeAssigned: "",
    driverAssigned: "john doe",
  },
  {
    id: "V002",
    registration: "MH14CD5678",
    model: "Bus",
    capacity: 15,
    fuelType: "Petrol",
    status: "inactive",
    ownership: "self-owned",
    img: null,
  },
  {
    id: "V003",
    registration: "MH12AB9876",
    model: "Bus",
    capacity: 50,
    fuelType: "Diesel",
    status: "active",
    ownership: "self-owned",
    img: "https://via.placeholder.com/150",
    yearOfManufacture: "sept 2020",
    pollutionValidUntil: "12 jan 2025",
    lastServiceDate: "15 oct 2024",
    totalKm: "5000km",
    insuranceExpiry: "2024",
    maintenanceCost: "500",
    fuelCharge: "700",
    chassisNumber: "as1234zy6789",
    engineNumber: "123456",
    color: "yellow",
    routeAssigned: "",
    driverAssigned: "",
  },
];

const VehicleDetails = () => {
  const { id } = useParams(); // Extract vehicle ID from the URL
  const navigate = useNavigate(); // For navigation
  const [vehicles, setVehicles] = useState(dummyVehicles); // Manage vehicle list locally

  // Find the vehicle with the given ID
  const vehicle = vehicles.find((v) => v.id === id);

  // If no vehicle is found, show a "not found" message
  if (!vehicle) {
    return (
      <div className="vehicle-details">
        <button onClick={() => navigate("/")} className="back-button">
          Go Back
        </button>
        <p>Vehicle not found.</p>
      </div>
    );
  }

  // Handler to delete the vehicle
  const handleDelete = () => {
    setVehicles(vehicles.filter((v) => v.id !== id)); // Remove the vehicle
    navigate("/"); // Navigate back to the main vehicle list
  };

  return (
    <div className="vehicle-details">
      <button onClick={() => navigate(-1)} className="back-button">
        Go Back
      </button>
      <div className="vehicle-info-container">
        <div className="vehicle-photo-section">
          {vehicle.img ? (
            <img
              src={vehicle.img}
              alt={`${vehicle.model}`}
              className="vehicle-photo"
              height={300}
            />
          ) : (
            <div className="vehicle-initials">
              {vehicle.model
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
        </div>
        <div className="vehicle-info">
          <h1>
            <strong>{vehicle.model}</strong>
          </h1>
          <p>
            <strong>Registration:</strong> {vehicle.registration}
          </p>
          <p>
            <strong>Capacity:</strong> {vehicle.capacity} seats
          </p>
          <p>
            <strong>Fuel Type:</strong> {vehicle.fuelType}
          </p>
          <p>
            <strong>Ownership:</strong> {vehicle.ownership}
          </p>
          <p>
            <strong>Driver Assigned:</strong> {vehicle.driverAssigned || "N/A"}
          </p>
          <p>
            <strong>Color:</strong> {vehicle.color || "N/A"}
          </p>
          <p>
            <strong>Insurance Expiry:</strong>{" "}
            {vehicle.insuranceExpiry || "N/A"}
          </p>
          <p>
            <strong>Manufacture Year:</strong>{" "}
            {vehicle.yearOfManufacture || "N/A"}
          </p>
          <p>
            <strong>Pollution Expiry Date:</strong>{" "}
            {vehicle.pollutionValidUntil || "N/A"}
          </p>
          <p>
            <strong>Last Service Date:</strong>{" "}
            {vehicle.lastServiceDate || "N/A"}
          </p>
          <p>
            <strong>Total Km:</strong> {vehicle.totalKm || "N/A"}
          </p>
          <p>
            <strong>Today's Maintenance Cost:</strong>{" "}
            {vehicle.maintenanceCost || "N/A"}
          </p>
          <p>
            <strong>Today's Fuel Cost:</strong> {vehicle.fuelCharge || "N/A"}
          </p>
          <p>
            <strong>Chassis Number:</strong> {vehicle.chassisNumber || "N/A"}
          </p>
          <p>
            <strong>Engine Number:</strong> {vehicle.engineNumber || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status ${vehicle.status}`}>{vehicle.status}</span>
          </p>
          <div className="vehicle-actions">
            <button
              // onClick={() => {
              //   navigate(`/edit-vehicle/${vehicle.id}`);
              // }}
              className="delete-button bg-blue-500"
            >
              Edit
            </button>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
