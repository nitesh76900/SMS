import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { VehicleHistoryService } from "../services/VehicleHistoryService";

// Custom marker icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

const VehicleTrackingPage = () => {
  const { id } = useParams();
  const [vehicleHistory, setVehicleHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicleHistory();
  }, [id]);

  const fetchVehicleHistory = async () => {
    try {
      const response = await VehicleHistoryService.getVehicleHistoryById(id);
      console.log("VehicleHistory Track", response);
      setVehicleHistory(response);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStop = async (stopName) => {
    try {
      setLoading(true);
      await VehicleHistoryService.updateVehicleHistoryStop({
        id,
        stopName,
      });
      await fetchVehicleHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const MapComponent = ({ vehicleHistory }) => {
    if (!vehicleHistory) return null;

    const routeCoordinates = vehicleHistory.stops.map(stop => [stop.lat, stop.lng]);
    const currentStop = vehicleHistory.stops.find(stop => stop.reached === 'Next');
    
    return (
      <MapContainer
        center={currentStop ? [currentStop.lat, currentStop.lng] : [26.9124, 75.7873]}
        zoom={9.5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Polyline
          positions={routeCoordinates}
          color="blue"
          weight={3}
          opacity={0.7}
        />
        {vehicleHistory.stops.map((stop, index) => (
          <Marker
            key={index}
            position={[stop.lat, stop.lng]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `
                <div style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background-color: ${
                    stop.reached === 'Reached' ? '#10B981' :
                    stop.reached === 'Next' ? '#3B82F6' :
                    stop.reached === 'Left' ? '#6B7280' :
                    '#EF4444'
                  };
                "></div>
              `,
            })}
          />
        ))}
      </MapContainer>
    );
  };

  if (loading && !vehicleHistory) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!vehicleHistory) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">No vehicle history found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4 shadow-lg overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Route Progress</h2>
          <div className="mb-4">
            <div className="font-bold">
              {vehicleHistory.vehicle?.registration} -{" "}
              {vehicleHistory.vehicle?.model}
            </div>
            <div className="text-sm text-gray-500">
              Driver: {vehicleHistory.driver?.staffId?.name}
              <br />
              Phone: {vehicleHistory.driver?.staffId?.phoneNo}
            </div>
            <div className="text-sm text-gray-500">
              Route: {vehicleHistory.route?.name}
            </div>
            <div className="text-sm text-gray-500">
              Date: {new Date(vehicleHistory.date).toLocaleDateString()}
            </div>
          </div>
          {vehicleHistory.stops.map((stop, index) => (
            <div
              key={index}
              className="p-4 border rounded flex items-center justify-between"
            >
              <div>
                <div className="font-bold">{stop.stop}</div>
                <div className="text-sm text-gray-500">
                  {stop.arrivalTime
                    ? new Date(stop.arrivalTime).toLocaleTimeString()
                    : "Not arrived"}
                </div>
              </div>
              {stop.reached === "Next" && !vehicleHistory.completed && (
                <button
                  onClick={() => handleUpdateStop(stop.stop)}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {loading ? "Updating..." : "Mark Reached"}
                </button>
              )}
              <div
                className={`w-3 h-3 rounded-full ${
                  stop.reached === "Reached"
                    ? "bg-green-500"
                    : stop.reached === "Next"
                    ? "bg-blue-500"
                    : stop.reached === "Left"
                    ? "bg-gray-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          ))}
          {vehicleHistory.completed && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
              Route Completed!
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="w-3/4 relative">
        <MapComponent vehicleHistory={vehicleHistory} />
      </div>
    </div>
  );
};

export default VehicleTrackingPage;