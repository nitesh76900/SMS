const Route = require("../models/RouteModels");
const Vehicle = require("../models/vehicleModels");
const emptyTempFolder = require("../utils/emptyTempFolder");



// Create a new route
exports.createRoute = async (req, res) => {
    try {
        const { name, vehicle, stops } = req.body;

        // Validate required fields
        if (!name || !vehicle || !stops || !Array.isArray(stops) || stops.length === 0) {
            return res.status(400).json({ error: "All fields (name, vehicle, and stops) are required." });
        }

        // Check if the vehicle exists
        const existingVehicle = await Vehicle.findById(vehicle);
        if (!existingVehicle) {
            return res.status(404).json({ error: "Vehicle not found." });
        }

        stops.forEach(e => {
            if (!e.stop || !e.lng || !e.lat || !e.sequence) {
                return res.status(400).json({ error: `Please enter name, lat, lng, sequence of stop plece` })
            }
        });

        // Create the route
        const newRoute = new Route({
            name,
            vehicle,
            stops,
        });

        const savedRoute = await newRoute.save();
        return res.status(201).json({ message: "Route created successfully.", data: savedRoute });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to create route." });
    } finally {
        await emptyTempFolder()
    }
};

// Update an existing route
exports.updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, vehicle, stops, active } = req.body;

        // Validate required fields
        if (!id) {
            return res.status(400).json({ error: "Route ID is required for update." });
        }

        if (stops) {
            stops.forEach(e => {
                if (!e.stop || !e.lng || !e.lat || !e.sequence) {
                    return res.status(400).json({ error: `Please enter name, lat, lng, sequence of stop plece` })
                }
            });
        }

        // Find and update the route
        const updatedRoute = await Route.findByIdAndUpdate(
            id,
            { name, vehicle, stops, active },
            { new: true, runValidators: true } // Return the updated document and validate fields
        );

        if (!updatedRoute) {
            return res.status(404).json({ error: "Route not found." });
        }

        return res.status(200).json({ message: "Route updated successfully.", data: updatedRoute });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to update route." });
    } finally {
        await emptyTempFolder()
    }
};

// Get a route by ID
exports.getRoute = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the route by ID and populate vehicle information
        const route = await Route.findById(id).populate('vehicle');
        if (!route) {
            return res.status(404).json({ error: "Route not found." });
        }

        return res.status(200).json({ data: route });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to retrieve route." });
    }
};

// Get all routes
exports.getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find().populate('vehicle');
        return res.status(200).json({ data: routes });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to retrieve routes." });
    }
};
