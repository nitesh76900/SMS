import React, { useState, useEffect } from "react";
import { MapPin, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RouteService from "../../services/RouteService";
const BusRoute = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await RouteService.getAllRoutes();
      console.log("Routes:", response.data);
      setRoutes(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    navigate("/add-route-form");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-100 text-red-800 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bus Route Management
        </h1>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          onClick={handleAddRoute}
        >
          Add New Route
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route, index) => (
          <div
            key={route._id || index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {route.name || `Route ${index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Vehicle Reg: {route.vehicle?.registration}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    route.vehicle?.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {route.vehicle?.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Route Details
                  </h4>
                  <div className="space-y-2">
                    {route.stops?.map((stop, idx) => (
                      <div key={stop._id} className="flex items-start gap-2">
                        <div className="min-w-6 h-6 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{stop.stop}</p>
                          <p className="text-xs text-gray-500">
                            ({stop.lat.toFixed(4)}, {stop.lng.toFixed(4)})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Vehicle Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Model:</span>{" "}
                      {route.vehicle?.model}
                    </p>
                    <p>
                      <span className="text-gray-600">Color:</span>{" "}
                      {route.vehicle?.color}
                    </p>
                    <p>
                      <span className="text-gray-600">Chassis:</span>{" "}
                      {route.vehicle?.chassisNumber}
                    </p>
                    <p>
                      <span className="text-gray-600">Engine:</span>{" "}
                      {route.vehicle?.engineNumber}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className=" w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={() => navigate(`/edit-route-form/${route?._id}`)}
              >
                Edit Route
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusRoute;
