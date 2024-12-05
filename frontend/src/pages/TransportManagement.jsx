import {
  Bell,
  Menu,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Truck,
  MapPin,
  DollarSign,
} from "lucide-react";
import { DriverModal } from "../modals/DriverModal";
import { VehicleModal } from "../modals/VehicleModal";
import { useState } from "react";

// Initial dummy data
const initialDrivers = [
  {
    driverId: "D001",
    name: "John Smith",
    age: 35,
    licenseNumber: "DL123456",
    phoneNumber: "+1-234-567-8900",
    address: "123 Main St, City",
    assignedVehicleId: "V001",
    employmentStatus: "active",
    experience: 8,
    salary: 45000,
    startDate: "2019-03-15",
  },
  {
    driverId: "D002",
    name: "Sarah Johnson",
    age: 42,
    licenseNumber: "DL789012",
    phoneNumber: "+1-234-567-8901",
    address: "456 Oak Ave, Town",
    assignedVehicleId: "V002",
    employmentStatus: "active",
    experience: 12,
    salary: 52000,
    startDate: "2015-06-22",
  },
];

const initialVehicles = [
  {
    vehicleId: "V001",
    type: "bus",
    registrationNumber: "BUS001",
    capacity: 45,
    fuelType: "diesel",
    dailyFuelConsumption: 25,
    mileage: 50000,
    insuranceExpiry: "2024-12-31",
    lastMaintenanceDate: "2024-03-15",
    maintenanceCost: {
      daily: 50,
      monthly: 1500,
      yearly: 18000,
    },
    availabilityStatus: "available",
    assignedDriverId: "D001",
  },
  {
    vehicleId: "V002",
    type: "van",
    registrationNumber: "VAN001",
    capacity: 15,
    fuelType: "petrol",
    dailyFuelConsumption: 12,
    mileage: 35000,
    insuranceExpiry: "2024-12-31",
    lastMaintenanceDate: "2024-03-10",
    maintenanceCost: {
      daily: 30,
      monthly: 900,
      yearly: 10800,
    },
    availabilityStatus: "in use",
    assignedDriverId: "D002",
  },
];

const TransportManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState("drivers");
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState(initialDrivers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [driverFormData, setDriverFormData] = useState({});
  const [vehicleFormData, setVehicleFormData] = useState({});

  // Filter functions
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD operations for drivers
  const handleAddDriver = () => {
    setEditingDriver(null);
    setDriverFormData({});
    setShowDriverModal(true);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setDriverFormData(driver);
    setShowDriverModal(true);
  };

  const handleDeleteDriver = (driverId) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      setDrivers(drivers.filter((driver) => driver.driverId !== driverId));
      // Also update any assigned vehicles
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.assignedDriverId === driverId
            ? { ...vehicle, assignedDriverId: null }
            : vehicle
        )
      );
    }
  };

  const handleDriverSubmit = (e) => {
    e.preventDefault();
    if (editingDriver) {
      // Update existing driver
      setDrivers(
        drivers.map((driver) =>
          driver.driverId === editingDriver.driverId
            ? { ...driver, ...driverFormData }
            : driver
        )
      );
    } else {
      // Add new driver
      const newDriver = {
        ...driverFormData,
        driverId: `D${String(drivers.length + 1).padStart(3, "0")}`,
        startDate: new Date().toISOString().split("T")[0],
      };
      setDrivers([...drivers, newDriver]);
    }
    setShowDriverModal(false);
    setDriverFormData({});
    setEditingDriver(null);
  };

  // CRUD operations for vehicles
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleFormData({});
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleFormData(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles(
        vehicles.filter((vehicle) => vehicle.vehicleId !== vehicleId)
      );
      // Also update any assigned drivers
      setDrivers(
        drivers.map((driver) =>
          driver.assignedVehicleId === vehicleId
            ? { ...driver, assignedVehicleId: null }
            : driver
        )
      );
    }
  };

  const handleVehicleSubmit = (e) => {
    e.preventDefault();
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.vehicleId === editingVehicle.vehicleId
            ? { ...vehicle, ...vehicleFormData }
            : vehicle
        )
      );
    } else {
      // Add new vehicle
      const newVehicle = {
        ...vehicleFormData,
        vehicleId: `V${String(vehicles.length + 1).padStart(3, "0")}`,
        maintenanceCost: {
          daily: 0,
          monthly: 0,
          yearly: 0,
        },
      };
      setVehicles([...vehicles, newVehicle]);
    }
    setShowVehicleModal(false);
    setVehicleFormData({});
    setEditingVehicle(null);
  };

  // Handle add/edit modal display
  const handleAddNew = () => {
    if (activeTab === "drivers") {
      handleAddDriver();
    } else if (activeTab === "vehicles") {
      handleAddVehicle();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="m">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="ml-2 text-2xl font-bold text-gray-800">
                  Transport Management
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("drivers")}
              className={`${
                activeTab === "drivers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Users className="h-5 w-5 mr-2" />
              Drivers
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`${
                activeTab === "vehicles"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Truck className="h-5 w-5 mr-2" />
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab("routes")}
              className={`${
                activeTab === "routes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <MapPin className="h-5 w-5 mr-2" />
              Routes
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`${
                activeTab === "expenses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Expenses
            </button>
          </nav>
        </div>
        {/* Search and Add Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-between  w-full items-center relative flex-1 ">
            {/* Search input */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full leading-5 bg-gray-100 placeholder-gray-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition duration-200 ease-in-out"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Add New button */}
            <button
              onClick={handleAddNew}
              className="ml-4 min-w-40 inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-full shadow-md text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New
            </button>
          </div>
        </div>

        {/* Routes Content */}
        {activeTab === "routes" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Route Management Coming Soon
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>This feature is under development.</p>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Content */}
        {activeTab === "expenses" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Expense Tracking Coming Soon
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>This feature is under development.</p>
              </div>
            </div>
          </div>
        )}
        {/* Drivers Content */}
        {activeTab === "drivers" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.driverId}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {driver.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {driver.driverId}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          License Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {driver.licenseNumber}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {driver.phoneNumber}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Experience
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {driver.experience} years
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Status
                        </dt>
                        <dd className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              driver.employmentStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {driver.employmentStatus}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Content */}
        {activeTab === "vehicles" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full ">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.vehicleId}
                className="min-w-96 bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {vehicle.type.charAt(0).toUpperCase() +
                          vehicle.type.slice(1)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Reg: {vehicle.registrationNumber}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Capacity
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vehicle.capacity} seats
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Fuel Type
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vehicle.fuelType.charAt(0).toUpperCase() +
                            vehicle.fuelType.slice(1)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Daily Fuel
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vehicle.dailyFuelConsumption} L
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Status
                        </dt>
                        <dd className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              vehicle.availabilityStatus === "available"
                                ? "bg-green-100 text-green-800"
                                : vehicle.availabilityStatus === "in use"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {vehicle.availabilityStatus}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Routes Content */}
        {activeTab === "routes" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Route Management Coming Soon
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>This feature is under development.</p>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Content */}
        {activeTab === "expenses" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Expense Tracking Coming Soon
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>This feature is under development.</p>
              </div>
            </div>
          </div>
        )}

        <DriverModal
          isOpen={showDriverModal}
          onClose={() => {
            setShowDriverModal(false);
            setEditingDriver(null);
            setDriverFormData({});
          }}
          onSubmit={handleDriverSubmit}
          formData={driverFormData}
          setFormData={setDriverFormData}
          editingItem={editingDriver}
        />

        <VehicleModal
          isOpen={showVehicleModal}
          onClose={() => {
            setShowVehicleModal(false);
            setEditingVehicle(null);
            setVehicleFormData({});
          }}
          onSubmit={handleVehicleSubmit}
          formData={vehicleFormData}
          setFormData={setVehicleFormData}
          editingItem={editingVehicle}
        />
      </div>
    </div>
  );
};

export default TransportManagement;
