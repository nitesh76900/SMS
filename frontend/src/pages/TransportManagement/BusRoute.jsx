import React, { useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const BusRoute = () => {
  const [routes, setRoutes] = useState([]);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [formData, setFormData] = useState({
    busNumber: "",
    routeDistance: "",
    startLocation: "",
    endLocation: "",
  });
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [stopPoints, setStopPoints] = useState([]);
  const [driverLocation, setDriverLocation] = useState({ lat: null, lng: null });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRoute = () => {
    setShowAddRouteModal(true);
  };

  const handleNextToMap = () => {
    setShowAddRouteModal(false);
    setShowMapModal(true);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setStopPoints((prev) => [...prev, { lat, lng }]);
  };

  const handleConfirmRoute = () => {
    const newRoute = {
      ...formData,
      stopPoints,
      driverLocation: { lat: null, lng: null },
    };
    setRoutes((prev) => [...prev, newRoute]);
    setShowMapModal(false);
    setFormData({
      busNumber: "",
      routeDistance: "",
      startLocation: "",
      endLocation: "",
    });
    setStopPoints([]);
  };

  const handleViewTracking = (index) => {
    setSelectedRouteIndex(index);
    setShowTrackingModal(true);
  };

  const handleDriverLocationUpdate = (e) => {
    const { name, value } = e.target;
    setDriverLocation((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const confirmDriverLocation = () => {
    if (selectedRouteIndex !== null) {
      const updatedRoutes = [...routes];
      updatedRoutes[selectedRouteIndex].driverLocation = driverLocation;
      setRoutes(updatedRoutes);
      setShowTrackingModal(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bus Route Management</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={handleAddRoute}
      >
        Add New Route
      </button>

      {/* Route Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route, index) => (
          <div
            key={index}
            className="border rounded-md p-4 shadow-md"
          >
            <h3 className="text-lg font-bold">Route {index + 1}</h3>
            <p>Bus Number: {route.busNumber}</p>
            <p>Route Distance: {route.routeDistance}</p>
            <p>Start: {route.startLocation}</p>
            <p>End: {route.endLocation}</p>
            <p>
              Driver Location:{" "}
              {route.driverLocation.lat && route.driverLocation.lng
                ? `(${route.driverLocation.lat}, ${route.driverLocation.lng})`
                : "Not updated"}
            </p>
            <button
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md"
              onClick={() => handleViewTracking(index)}
            >
              Update Driver Location
            </button>
          </div>
        ))}
      </div>

      {/* Add Route Modal */}
      {showAddRouteModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Route</h2>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleInputChange}
              className="w-full mb-2 p-2 border rounded"
              placeholder="bus number"
            />
            <input
              type="text"
              name="routeDistance"
              value={formData.routeDistance}
              onChange={handleInputChange}
              className="w-full mb-2 p-2 border rounded"
              placeholder="route Distance"

            />
            <input
              type="text"
              name="startLocation"
              value={formData.startLocation}
              onChange={handleInputChange}
              className="w-full mb-2 p-2 border rounded"
              placeholder="start Location"
              
            />
            <input
              type="text"
              name="endLocation"
              value={formData.endLocation}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
              placeholder="end Locationn"

            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowAddRouteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleNextToMap}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed  inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white-800 rounded-lg w-full h-full p-6 relative">
            <h2 className="text-xl font-bold mb-4">Select Bus Stops</h2>
            <MapContainer
              center={[26.9124, 75.7873]} // Jaipur's approximate coordinates
              zoom={12}
              style={{ height: "600px", width: "600px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onClick={handleMapClick} />
              {stopPoints.map((point, index) => (
                <Marker key={index} position={[point.lat, point.lng]} />
              ))}
              <Polyline positions={stopPoints.map((point) => [point.lat, point.lng])} color="blue" />
            </MapContainer>
            <div className="fixed bottom-4 left-4 flex space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowMapModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleConfirmRoute}
              >
                Confirm Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bus Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">Update Driver Location</h2>
            <input
              type="number"
              name="lat"
              value={driverLocation.lat || ""}
              onChange={handleDriverLocationUpdate}
              className="w-full mb-2 p-2 border rounded"
              placeholder="Latitude"
            />
            <input
              type="number"
              name="lng"
              value={driverLocation.lng || ""}
              onChange={handleDriverLocationUpdate}
              className="w-full mb-4 p-2 border rounded"
              placeholder="Longitude"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowTrackingModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={confirmDriverLocation}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for Map Clicks
const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click: (e) => onClick(e),
  });
  return null;
};

export default BusRoute;
