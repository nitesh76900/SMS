import React, { useState, useEffect } from "react";
import VehicleService from "../../services/VehicleService";
import { toast } from "react-hot-toast";
import DriverService from "../../services/DriverService";
import RouteService from "../../services/RouteService";

const VehicleForm = ({ onClose, onSave, vehicleId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    model: "",
    registration: "",
    ownership: "owned",
    yearOfManufacture: "",
    pollutionValidUntil: "",
    lastServiceDate: "",
    totalKm: "0",
    insuranceExpiry: "",
    maintenanceCost: "0",
    fuelCharge: "0",
    chassisNumber: "",
    engineNumber: "",
    color: "Blue",
    routeAssigned: null,
    driverAssigned: [],
    img: null,
  });
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const driversResponse = await DriverService.getAllDrivers();
        const routesResponse = await RouteService.getRoutesForDropdown();
        const driversData = Array.isArray(driversResponse.data)
          ? driversResponse.data
          : [];
        const routesData = Array.isArray(routesResponse) ? routesResponse : [];
        setDrivers(driversData);
        setRoutes(routesData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch form data");
      }
    };

    fetchDropdownData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const response = await VehicleService.getVehicle(vehicleId);
      const vehicle = response?.data;
      const formatDate = (date) =>
        date ? new Date(date).toISOString().split("T")[0] : "";
      setFormData({
        model: vehicle.model || "",
        registration: vehicle.registration || "",
        ownership: vehicle.ownership || "owned",
        yearOfManufacture: vehicle.yearOfManufacture || "",
        pollutionValidUntil: formatDate(vehicle.pollutionValidUntil),
        lastServiceDate: formatDate(vehicle.lastServiceDate),
        totalKm: vehicle.totalKm || "0",
        insuranceExpiry: formatDate(vehicle.insuranceExpiry),
        maintenanceCost: vehicle.maintenanceCost || "0",
        fuelCharge: vehicle.fuelCharge || "0",
        chassisNumber: vehicle.chassisNumber || "",
        engineNumber: vehicle.engineNumber || "",
        color: vehicle.color || "Blue",
        routeAssigned: vehicle.routeAssigned || null,
        driverAssigned: vehicle.driverAssigned || [],
        img: vehicle.img?.url || null,
      });
    } catch (error) {
      toast.error("Failed to fetch vehicle details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDriverAssignmentChange = (e) => {
    const options = e.target.options;
    const selectedDrivers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedDrivers.push(options[i].value);
      }
    }
    setFormData({ ...formData, driverAssigned: selectedDrivers });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, img: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start submission process
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "driverAssigned") {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === "img" && formData[key] instanceof File) {
          data.append("image", formData[key]);
        } else if (formData[key] === null) {
          // Skip null values
        } else if (
          key === "yearOfManufacture" ||
          key === "totalKm" ||
          key === "maintenanceCost" ||
          key === "fuelCharge"
        ) {
          data.append(key, parseInt(formData[key], 10));
        } else {
          data.append(key, formData[key]);
        }
      });

      let response;
      if (vehicleId) {
        response = await VehicleService.updateVehicle(vehicleId, data);
      } else {
        response = await VehicleService.addVehicle(data);
      }

      toast.success(
        vehicleId
          ? "Vehicle updated successfully"
          : "Vehicle added successfully"
      );
      onSave(response.data);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save vehicle");
    } finally {
      setIsSubmitting(false); // End submission process
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const inputClassName =
    "mt-1 block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const sectionClassName =
    "bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200";
  const headerClassName =
    "text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2";

  return (
    <div className="fixed inset-0 z-50  bg-black bg-opacity-50 overflow-y-auto left-72">
      <div className="flex min-h-screen items-start justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 mt-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {vehicleId ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section className={sectionClassName}>
              <h3 className={headerClassName}>
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                    placeholder="Enter vehicle model"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration"
                    value={formData.registration}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                    placeholder="Enter registration number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                    placeholder="Enter vehicle color"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ownership
                  </label>
                  <select
                    name="ownership"
                    value={formData.ownership}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                  >
                    <option value="owned">Owned</option>
                    <option value="leased">Leased</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Technical Information */}
            <section className={sectionClassName}>
              <h3 className={headerClassName}>Technical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                    placeholder="Enter chassis number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                    placeholder="Enter engine number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Year of Manufacture
                  </label>
                  <input
                    type="number"
                    name="yearOfManufacture"
                    value={formData.yearOfManufacture}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                    className={inputClassName}
                    placeholder="Enter manufacture year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Kilometers
                  </label>
                  <input
                    type="number"
                    name="totalKm"
                    value={formData.totalKm}
                    onChange={handleChange}
                    min="0"
                    required
                    className={inputClassName}
                    placeholder="Enter total kilometers"
                  />
                </div>
              </div>
            </section>

            {/* Dates and Documentation */}
            <section className={sectionClassName}>
              <h3 className={headerClassName}>Dates and Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pollution Valid Until
                  </label>
                  <input
                    type="date"
                    name="pollutionValidUntil"
                    value={formData.pollutionValidUntil}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Service Date
                  </label>
                  <input
                    type="date"
                    name="lastServiceDate"
                    value={formData.lastServiceDate}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={handleChange}
                    required
                    className={inputClassName}
                  />
                </div>
              </div>
            </section>

            {/* Operational Information */}
            <section className={sectionClassName}>
              <h3 className={headerClassName}>Operational Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maintenance Cost
                  </label>
                  <input
                    type="number"
                    name="maintenanceCost"
                    value={formData.maintenanceCost}
                    onChange={handleChange}
                    min="0"
                    required
                    className={inputClassName}
                    placeholder="Enter maintenance cost"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fuel Charge
                  </label>
                  <input
                    type="number"
                    name="fuelCharge"
                    value={formData.fuelCharge}
                    onChange={handleChange}
                    min="0"
                    required
                    className={inputClassName}
                    placeholder="Enter fuel charge"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Route Assigned
                  </label>
                  <select
                    name="routeAssigned"
                    value={formData.routeAssigned}
                    onChange={handleChange}
                    className={inputClassName}
                  >
                    <option value="">Select Route</option>
                    {routes.map((route, index) => (
                      <option key={index} value={route.value}>
                        {route.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assigned Drivers
                  </label>
                  <select
                    multiple
                    value={formData.driverAssigned}
                    onChange={handleDriverAssignmentChange}
                    className={`${inputClassName} h-32`}
                  >
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.staffId.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Photo Upload */}
            <section className={sectionClassName}>
              <h3 className={headerClassName}>Vehicle Photo</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {formData.img && (
                    <div className="flex-shrink-0">
                      <img
                        src={
                          formData.img instanceof File
                            ? URL.createObjectURL(formData.img)
                            : formData.img
                        }
                        alt="Vehicle Preview"
                        className="h-24 w-24 object-cover rounded-lg ring-2 ring-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 text-sm font-medium text-white ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                {isSubmitting
                  ? vehicleId
                    ? "Updating..."
                    : "Adding..."
                  : vehicleId
                  ? "Update Vehicle"
                  : "Add Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
