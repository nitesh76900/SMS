const VehicleHistory = require("../models/VehicleHistoryModels");
const Vehicle = require("../models/vehicleModels");
const Route = require("../models/RouteModels");
const { isValidObjectId } = require("mongoose");

// Helper function to check if user is authorized
const isAuthorized = (user, vehicle) => {
  console.log(vehicle.driverAssigned.includes(user._id))
  return (user.role === "superAdmin" || vehicle?.driverAssigned?.includes(user._id));
  // || vehicle.driver.includes(user._id);
};

// Add new vehicle history entry
exports.addVehicleHistory = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { vehicleId, driverId, routeId, date } = req.body;

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Verify user authorization
    console.log("req.user", req.user);
    if (!isAuthorized(req.user, vehicle)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get route details
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Create stops array with initial status
    const stops = route.stops.map((stop, index) => ({
      stop: stop.stop,
      lng: stop.lng,
      lat: stop.lat,
      reached: index === 0 ? "Next" : "Pending",
      arrivalTime: null,
    }));

    // Create new vehicle history entry
    const vehicleHistory = new VehicleHistory({
      vehicle: vehicleId,
      driver: driverId,
      route: routeId,
      date,
      stops,
      completed: false,
    });

    await vehicleHistory.save();

    res.status(201).json({
      success: true,
      data: vehicleHistory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error creating vehicle history",
    });
  }
};

// Update vehicle history when stop is reached
exports.updateVehicleHistoryStop = async (req, res) => {
  try {
    console.log("req,body", req.body);
    const { historyId, stopName } = req.body;

    // Find vehicle history entry
    const history = await VehicleHistory.findById(historyId);
    if (!history) {
      return res.status(404).json({ message: "Vehicle history not found" });
    }

    // Check vehicle and authorization
    const vehicle = await Vehicle.findById(history.vehicle);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (!isAuthorized(req.user, vehicle)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find the current stop index
    const currentStopIndex = history.stops.findIndex(
      (stop) => stop.stop === stopName
    );
    if (currentStopIndex === -1) {
      return res.status(404).json({ message: "Stop not found in route" });
    }

    // Update current stop status and arrival time
    history.stops[currentStopIndex].reached = "Reached";
    history.stops[currentStopIndex].arrivalTime = new Date();

    // Update previous stop to 'Left' if exists
    if (currentStopIndex > 0) {
      history.stops[currentStopIndex - 1].reached = "Left";
    }

    // Set next stop as 'Next' if exists
    if (currentStopIndex < history.stops.length - 1) {
      history.stops[currentStopIndex + 1].reached = "Next";
    }

    // Check if this is the last stop
    if (currentStopIndex === history.stops.length - 1) {
      history.completed = true;
    }

    await history.save();

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error updating vehicle history",
    });
  }
};

exports.getVehicleHistories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      id,
      stopName,
      startDate,
      endDate,
      vehicle,
      driver,
      route,
    } = req.query;

    // Build base query
    let query = {};

    // If ID is provided, return single record
    if (id) {
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid history ID",
        });
      }
      query._id = id;
    }

    // Add completed status filter
    // if (completed !== undefined) {
    //     query.completed = completed === 'true';
    // }

    // Add date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Add reference filters
    if (vehicle && isValidObjectId(vehicle)) {
      query.vehicle = vehicle;
    }
    if (driver && isValidObjectId(driver)) {
      query.driver = driver;
    }
    if (route && isValidObjectId(route)) {
      query.route = route;
    }

    // Add stop filters
    if (stopName) {
      query["stops.stop"] = { $regex: stopName, $options: "i" };
      if (stopStatus) {
        query["stops.reached"] = stopStatus;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await VehicleHistory.countDocuments(query);

    // Execute query
    const histories = await VehicleHistory.find(query)
      .populate({
        path: "vehicle",
        select: "registration model",
      })
      .populate({
        path: "driver",
        select: "staffId",
        populate: {
          path: "staffId", // Populate staffId within driver
          select: "name phoneNo", // Select name and phoneNumber fields in staffId
        },
      })
      .populate({
        path: "route",
        select: "name description",
      })
      .sort({ date: -1 })
      .skip(id ? 0 : skip) // Skip pagination if getting by ID
      .limit(id ? 1 : parseInt(limit)); // Limit to 1 if getting by ID

    // Handle not found for ID search
    if (id && histories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "History not found",
      });
    }

    res.json({
      success: true,
      data: id ? histories[0] : histories,
      ...(id
        ? {}
        : {
            pagination: {
              total,
              page: parseInt(page),
              pages: Math.ceil(total / parseInt(limit)),
            },
          }),
    });
  } catch (error) {
    console.error("Error in getVehicleHistories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
