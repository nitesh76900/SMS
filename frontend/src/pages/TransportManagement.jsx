import React, { useState } from "react";
import DriversTab from "./TransportManagement/DriversTab";
import VehiclesTab from "./TransportManagement/VehiclesTab";
import BusRoute from "./TransportManagement/BusRoute";
import "../App.css";

const TransportManagement = () => {
  const [activeTab, setActiveTab] = useState("drivers");

  return (
    <div className="app-container">
      <div className="app-container-head">
        <h1>Transport Management</h1>
        <nav className="tabs">
          <button
            onClick={() => setActiveTab("drivers")}
            className={activeTab === "drivers" ? "active" : ""}
          >
            Drivers
          </button>
          <button
            onClick={() => setActiveTab("vehicles")}
            className={activeTab === "vehicles" ? "active" : ""}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveTab("routes")}
            className={activeTab === "routes" ? "active" : ""}
          >
            Routes
          </button>
          {/* <button onClick={() => setActiveTab("expenses")} className={activeTab === "expenses" ? "active" : ""}>Expenses</button> */}
        </nav>
      </div>
      <div className="content">
        <>
          {activeTab === "drivers" && <DriversTab />}
          {activeTab === "vehicles" && <VehiclesTab />}
          {activeTab === "routes" && <BusRoute />}
          {/* {activeTab === "expenses" && <ExpensesTab />} */}
        </>
      </div>
    </div>
  );
};

export default TransportManagement;
