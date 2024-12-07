import React, { useState } from "react";
import { Link } from "react-router-dom";
import VehicleForm from "./VehicleForm";
import "./VehiclesTab.css";
import data from "./InitialData.json";

const VehicleTab = () => {
  const [vehicles, setVehicles] = useState(data.vehicles);
  const availableDrivers = data.drivers;
  const availableRoutes = data.routes;

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);

  const handleAdd = () => {
    setCurrentVehicle(null);
    setShowForm(true);
  };

  const handleSave = (vehicle) => {
    if (currentVehicle) {
      setVehicles(
        vehicles.map((v) =>
          v.id === currentVehicle.id ? { ...vehicle, id: currentVehicle.id } : v
        )
      );
    } else {
      setVehicles([...vehicles, { ...vehicle, id: `V${vehicles.length + 1}` }]);
    }
    setShowForm(false);
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tab-container">
      
              <div className="tab-header">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-bar"
                />
                <button onClick={handleAdd} className="add-button">
                  + Add New
                </button>
              </div>
              <div className="vehicle-grid">
                {filteredVehicles.map((vehicle) => (
                  <Link
                    to={`/vehicle/${vehicle.id}`}
                    key={vehicle.id}
                    className="vehicle-card"
                  >
                    <div className="vehicle-photo-section">
                      {vehicle.img ? (
                        <img
                          src={vehicle.img}
                          alt={`${vehicle.model}'s photo`}
                          className="vehicle-photo"
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
                      <h3>{vehicle.model}</h3>
                      <p>Registration: {vehicle.registration}</p>
                      <p>Capacity: {vehicle.capacity} seats</p>
                      <p>Fuel Type: {vehicle.fuelType}</p>
                      <p>Ownership: {vehicle.ownership}</p>
                      <p>
                        Assigned Driver:
                        <strong>{vehicle.driverAssigned}</strong>
                      </p>
                      {/* <p>Assinged Route:<strong>{vehicle.routeAssigned}</strong></p> */}
                      <p>
                        Status:{" "}
                        <span className={`status ${vehicle.status}`}>
                          {vehicle.status}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
                {filteredVehicles.length === 0 && <p>No vehicles found.</p>}
              </div>
              {showForm && (
                <VehicleForm
                  vehicle={currentVehicle}
                  onClose={() => setShowForm(false)}
                  onSave={handleSave}
                  availableDrivers={availableDrivers}
                  availableRoutes={availableRoutes}
                />
              )}
        
    </div>
  );
};

export default VehicleTab;
