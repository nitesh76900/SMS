import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { MapPin } from "lucide-react";
import VehicleService from "../../services/VehicleService";
import RouteService from "../../services/RouteService";
import { useNavigate, useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom icon creation
const createCustomIcon = () => {
  return L.divIcon({
    html: `<div class="custom-marker">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 5 10.25 7 12 2-1.75 7-6.75 7-12 0-3.866-3.134-7-7-7z"></path>
  <circle cx="12" cy="9" r="3"></circle>
  <defs>
    <radialGradient id="gradient" cx="12" cy="9" r="12" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4facfe" />
      <stop offset="100%" stop-color="#00f2fe" />
    </radialGradient>
  </defs>
  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 5 10.25 7 12 2-1.75 7-6.75 7-12 0-3.866-3.134-7-7-7z" fill="url(#gradient)" opacity="0.2"></path>
</svg>

           </div>`,
    className: "custom-marker-container",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Add styles to document head
const markerStyles = `
  .custom-marker-container {
    background: transparent;
    border: none;
  }
  .custom-marker {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .custom-marker svg {
    color: #3B82F6;
    filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.2));
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = markerStyles;
document.head.appendChild(styleSheet);

// Map Click Handler Component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
};

const RouteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    vehicle: "",
    stops: [],
  });
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [stopName, setStopName] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [mapCenter, setMapCenter] = useState([26.9124, 75.7873]);
  const [mapZoom, setMapZoom] = useState(9.5);
  const [mapRef, setMapRef] = useState(null);

  const customIcon = createCustomIcon();

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        await fetchVehicles();
        if (id) {
          await fetchRouteData();
        }
      } catch (err) {
        setError(err.message || "Failed to initialize form");
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [id]);

  const fetchVehicles = async () => {
    try {
      const response = await VehicleService.getAllVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      throw new Error("Failed to fetch vehicles");
    }
  };

  const fetchRouteData = async () => {
    try {
      const response = await RouteService.getRoute(id);
      const routeData = response.data;

      setFormData({
        name: routeData.name || "",
        vehicle: routeData.vehicle?._id || routeData.vehicle || "",
        stops: routeData.stops || [],
      });

      if (routeData.stops && routeData.stops.length > 0) {
        const firstStop = routeData.stops[0];
        setMapCenter([firstStop.lat, firstStop.lng]);
        if (mapRef) {
          const bounds = L.latLngBounds(
            routeData.stops.map((stop) => [stop.lat, stop.lng])
          );
          mapRef.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (error) {
      throw new Error("Failed to fetch route data");
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedPosition({ lat, lng });
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
    setError("");
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setError(
        "Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)"
      );
      return;
    }

    setSelectedPosition({ lat, lng });
    if (mapRef) {
      mapRef.setView([lat, lng], mapZoom);
    }
    setError("");
  };

  const handleAddStop = () => {
    if (!selectedPosition || !stopName.trim()) {
      setError("Please select a location on map and enter stop name");
      return;
    }

    const newStop = {
      stop: stopName.trim(),
      lat: selectedPosition.lat,
      lng: selectedPosition.lng,
      sequence: formData.stops.length + 1,
    };

    setFormData((prev) => ({
      ...prev,
      stops: [...prev.stops, newStop],
    }));
    setStopName("");
    setSelectedPosition(null);
    setManualLat("");
    setManualLng("");
    setError("");
  };

  const handleRemoveStop = (index) => {
    const updatedStops = formData.stops
      .filter((_, i) => i !== index)
      .map((stop, i) => ({ ...stop, sequence: i + 1 }));

    setFormData((prev) => ({
      ...prev,
      stops: updatedStops,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.name.trim()) {
        throw new Error("Please enter a route name");
      }

      if (!formData.vehicle) {
        throw new Error("Please select a vehicle");
      }

      if (formData.stops.length < 2) {
        throw new Error("Please add at least two stops for the route");
      }

      const routeData = {
        ...formData,
        stops: formData.stops.map((stop, index) => ({
          ...stop,
          sequence: index + 1,
        })),
      };

      if (id) {
        await RouteService.updateRoute(id, routeData);
      } else {
        await RouteService.createRoute(routeData);
      }

      navigate(-1);
    } catch (error) {
      setError(error.message || "Failed to save route");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {id ? "Edit Route" : "Create New Route"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter route name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Vehicle
                </label>
                <select
                  value={formData.vehicle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.model} - {vehicle.registration}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stops
                </label>

                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="Latitude"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="Longitude"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleManualCoordinates}
                    className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    className="h-full w-full"
                    ref={setMapRef}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />

                    {selectedPosition && (
                      <Marker
                        position={[selectedPosition.lat, selectedPosition.lng]}
                        icon={customIcon}
                      >
                        <Popup>
                          Selected Location
                          <br />
                          Lat: {selectedPosition.lat.toFixed(6)}
                          <br />
                          Lng: {selectedPosition.lng.toFixed(6)}
                        </Popup>
                      </Marker>
                    )}

                    {formData.stops.map((stop, index) => (
                      <Marker
                        key={index}
                        position={[stop.lat, stop.lng]}
                        icon={customIcon}
                      >
                        <Popup>
                          <div>
                            <strong>{stop.stop}</strong>
                            <br />
                            Stop {stop.sequence}
                            <br />
                            Lat: {stop.lat.toFixed(6)}
                            <br />
                            Lng: {stop.lng.toFixed(6)}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={stopName}
                      onChange={(e) => setStopName(e.target.value)}
                      placeholder="Enter stop name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add Stop
                    </button>
                  </div>

                  {formData.stops.length > 0 && (
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Current Stops:</h3>
                      <ul className="space-y-2">
                        {formData.stops.map((stop, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span>
                              {stop.stop} (Stop {stop.sequence}) - Lat:{" "}
                              {stop.lat.toFixed(6)}, Lng: {stop.lng.toFixed(6)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveStop(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  typetype="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {id ? "Update Route" : "Create Route"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RouteForm;
