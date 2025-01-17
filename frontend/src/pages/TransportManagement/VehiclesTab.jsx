import React, { useState, useEffect } from "react";
import VehicleForm from "./VehicleForm";
import VehicleService from "../../services/VehicleService";
import { toast } from "react-hot-toast";

const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await VehicleService.getAllVehicles();
      console.log("Vehicles:", response.data);
      setVehicles(response.data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedVehicleId(null);
    setShowForm(true);
  };

  const handleEdit = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setShowForm(true);
  };

  const handleVehicleSaved = async (vehicleData) => {
    try {
      await loadVehicles(); // Reload the list after save
      toast.success(
        selectedVehicleId
          ? "Vehicle updated successfully"
          : "Vehicle added successfully"
      );
    } catch (err) {
      toast.error("Failed to refresh vehicle list");
    }
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await VehicleService.deleteVehicle(vehicleId);
        toast.success("Vehicle deleted successfully");
        await loadVehicles();
      } catch (err) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div className="aspect-video w-full bg-gray-100">
              {vehicle.img?.url ? (
                <img
                  src={vehicle.img.url}
                  alt={`${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                  {vehicle.model
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Reg: {vehicle.registration}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    vehicle.status
                  )}`}
                >
                  {vehicle.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chassis Number</span>
                  <span className="text-gray-900">{vehicle.chassisNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Engine Number</span>
                  <span className="text-gray-900">{vehicle.engineNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Color</span>
                  <span className="text-gray-900">{vehicle.color}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Year</span>
                  <span className="text-gray-900">
                    {vehicle.yearOfManufacture}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total KM</span>
                  <span className="text-gray-900">{vehicle.totalKm} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ownership</span>
                  <span className="text-gray-900">{vehicle.ownership}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Insurance Expires</span>
                  <span className="text-gray-900">
                    {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Service Date</span>
                  <span className="text-gray-900">
                    {new Date(vehicle.lastServiceDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pollution Valid Until</span>
                  <span className="text-gray-900">
                    {new Date(vehicle.pollutionValidUntil).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Maintenance Cost</span>
                  <span className="text-gray-900">
                    ${vehicle.maintenanceCost}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fuel Charge</span>
                  <span className="text-gray-900">${vehicle.fuelCharge}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(vehicle._id)}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  disabled
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredVehicles.length === 0 && !loading && (
          <div className="col-span-full flex items-center justify-center p-8 text-gray-500">
            No vehicles found.
          </div>
        )}
      </div>

      {showForm && (
        <VehicleForm
          onClose={() => setShowForm(false)}
          onSave={handleVehicleSaved}
          vehicleId={selectedVehicleId}
        />
      )}
    </div>
  );
};

export default VehiclesTab;
