import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DriverForm from "./DriverForm";
import "./DriversTab.css";
import data from "./InitialData.json";

const DriverTab = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { from, search } = location.state || {};
  const [drivers, setDrivers] = useState(data.drivers);
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [showForm, setShowForm] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);

  useEffect(() => {
    if (search) {
      setSearchTerm(search);
    }
  }, [search]);

  const handleAdd = () => {
    setCurrentDriver(null);
    setShowForm(true);
  };

  const handleEdit = (driver) => {
    setCurrentDriver(driver);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDrivers(drivers.filter((driver) => driver.id !== id));
  };

  const handleSave = (driver) => {
    if (currentDriver) {
      setDrivers((prevDrivers) =>
        prevDrivers.map((d) =>
          d.id === currentDriver.id ? { ...driver, id: currentDriver.id } : d
        )
      );
    } else {
      setDrivers((prevDrivers) => [
        ...prevDrivers,
        { ...driver, id: `D${prevDrivers.length + 1}` },
      ]);
    }
    setShowForm(false);
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tab-container">
      <div className="tab-header">
        {/* {from === "VehicleDetails" && (
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
        )} */}
        <input
          type="text"
          placeholder="Search drivers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <button onClick={handleAdd} className="add-button">
          + Add New
        </button>
      </div>

      <div className="driver-grid">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="driver-card">
            <div className="driver-initials">
              {driver.img ? (
                <img
                  src={driver.img}
                  alt={`${driver.name}'s photo`}
                  className="driver-photo"
                />
              ) : (
                driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              )}
            </div>
            <div className="driver-info">
              <h3>{driver.name}</h3>
              <p>ID: {driver.id}</p>
              <p>License Number: {driver.license}</p>
              <p>Phone: {driver.phone}</p>
              <p>Experience: {driver.experience} years</p>
              <p>
                Status:{" "}
                <span className={`status ${driver.status}`}>
                  {driver.status}
                </span>
              </p>
              <div className="driver-actions">
                <button
                  onClick={() => handleEdit(driver)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(driver.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredDrivers.length === 0 && <p>No drivers found.</p>}
      </div>
      {showForm && (
        <DriverForm
          driver={currentDriver}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default DriverTab;
