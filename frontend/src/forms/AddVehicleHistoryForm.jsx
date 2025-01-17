import React, { useState, useEffect } from "react";
import { VehicleService } from "../services/VehicleService";
import DriverService from "../services/DriverService";
import RouteService from "../services/RouteService";
import { VehicleHistoryService } from "../services/VehicleHistoryService";

const AddVehicleHistoryForm = ({ onSuccess, onCancel }) => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    selectedVehicle: "",
    selectedDriver: "",
    selectedRoute: "",
    date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes, routesRes] = await Promise.all([
          VehicleService.getAllVehicles(),
          DriverService.getAllDrivers(),
          RouteService.getAllRoutes(),
        ]);

        console.log("vehiclesRes.data", vehiclesRes.data);
        console.log("driversRes.data", driversRes.data);
        console.log("routesRes.data", routesRes.data);
        setVehicles(vehiclesRes.data);
        setDrivers(driversRes.data);
        setRoutes(routesRes.data);
      } catch (err) {
        setError("Failed to load form data: " + err.message);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await VehicleHistoryService.addVehicleHistory({
        vehicleId: formData.selectedVehicle,
        driverId: formData.selectedDriver,
        routeId: formData.selectedRoute,
        date: formData.date,
      });

      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle
        </label>
        <select
          name="selectedVehicle"
          value={formData.selectedVehicle}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.registration} - {vehicle.model}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Driver
        </label>
        <select
          name="selectedDriver"
          value={formData.selectedDriver}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Driver</option>
          {drivers.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {driver.staffId.name} - {driver.staffId.phoneNo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Route
        </label>
        <select
          name="selectedRoute"
          value={formData.selectedRoute}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Route</option>
          {routes.map((route) => (
            <option key={route._id} value={route._id}>
              {route.name} ({route.stops.length} stops)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create History"}
        </button>
      </div>
    </form>
  );
};

export default AddVehicleHistoryForm;
