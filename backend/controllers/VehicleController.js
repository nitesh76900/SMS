const Vehicle = require("../models/vehicleModels");
const uploadOnCloudinary = require("../utils/cloudinary");
const { isValidObjectId } = require("mongoose");
const emptyTempFolder = require("../utils/emptyTempFolder");

const validateVehicleData = (data) => {
  const errors = [];

  if (!data.model) errors.push("Model is required");
  if (!data.registration) errors.push("Registration number is required");
  if (!data.ownership) errors.push("Ownership status is required");
  if (!data.chassisNumber) errors.push("Chassis number is required");
  if (!data.engineNumber) errors.push("Engine number is required");

  // Validate dates
  const currentDate = new Date();

  if (data.yearOfManufacture) {
    const year = parseInt(data.yearOfManufacture);
    if (isNaN(year) || year < 1900 || year > currentDate.getFullYear()) {
      errors.push("Invalid year of manufacture");
    }
  }

  if (data.pollutionValidUntil) {
    const pollutionDate = new Date(data.pollutionValidUntil);
    if (pollutionDate < currentDate) {
      errors.push("Pollution validity date must be in the future");
    }
  }

  if (data.insuranceExpiry) {
    const insuranceDate = new Date(data.insuranceExpiry);
    if (insuranceDate < currentDate) {
      errors.push("Insurance expiry date must be in the future");
    }
  }

  // Validate numeric fields
  if (data.totalKm && (isNaN(data.totalKm) || data.totalKm < 0)) {
    errors.push("Total kilometers must be a positive number");
  }

  if (
    data.maintenanceCost &&
    (isNaN(data.maintenanceCost) || data.maintenanceCost < 0)
  ) {
    errors.push("Maintenance cost must be a positive number");
  }

  if (data.fuelCharge && (isNaN(data.fuelCharge) || data.fuelCharge < 0)) {
    errors.push("Fuel charge must be a positive number");
  }

  // Validate array of drivers
  if (data.driverAssigned) {
    if (!Array.isArray(data.driverAssigned)) {
      errors.push("Driver assigned must be an array");
    } else {
      // Check if each driver ID is valid
      const invalidDrivers = data.driverAssigned.filter(
        (id) => !isValidObjectId(id)
      );
      if (invalidDrivers.length > 0) {
        errors.push("One or more driver IDs are invalid");
      }
    }
  }

  console.log(data.routeAssigned);

  if (data.routeAssigned) {
    if (!isValidObjectId(data.routeAssigned)) {
      errors.push("Invalid route ID");
    }
  }

  return errors;
};

// Add new vehicle
exports.addVehicle = async (req, res) => {
  try {
    console.log(req.body)
    // Parse driverAssigned if it's sent as string
    if (
      req.body.driverAssigned &&
      typeof req.body.driverAssigned === "string"
    ) {
      try {
        req.body.driverAssigned = JSON.parse(req.body.driverAssigned);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid driver assigned format",
        });
      }
    }

    // Validate input data
    const validationErrors = validateVehicleData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    // Check for duplicate registration/chassis/engine numbers
    const existingVehicle = await Vehicle.findOne({
      $or: [
        { registration: req.body.registration },
        { chassisNumber: req.body.chassisNumber },
        { engineNumber: req.body.engineNumber },
      ],
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle with this registration, chassis, or engine number already exists",
      });
    }

    // Handle image upload
    let imageData = null;
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (!cloudinaryResponse) {
        return res.status(400).json({
          success: false,
          message: "Error uploading image",
        });
      }
      imageData = {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    // Create new vehicle
    const vehicleData = {
      ...req.body,
      img: imageData,
      status: "active",
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Populate driver information before sending response
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("driverAssigned", "name phoneNumber") // Adjust fields as needed
      .populate("routeAssigned");

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: populatedVehicle,
    });
  } catch (error) {
    console.error("Error in addVehicle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    await emptyTempFolder()
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse driverAssigned if it's sent as string
    if (
      req.body.driverAssigned &&
      typeof req.body.driverAssigned === "string"
    ) {
      try {
        req.body.driverAssigned = JSON.parse(req.body.driverAssigned);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid driver assigned format",
        });
      }
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    // Validate input data
    const validationErrors = validateVehicleData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Handle image update if new image is provided
    let imageData = existingVehicle.img;
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (!cloudinaryResponse) {
        return res.status(400).json({
          success: false,
          message: "Error uploading new image",
        });
      }

      // Delete old image from Cloudinary if it exists
      if (existingVehicle.img && existingVehicle.img.public_id) {
        await cloudinary.uploader.destroy(existingVehicle.img.public_id);
      }

      imageData = {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    // Update vehicle
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        ...req.body,
        img: imageData,
      },
      { new: true, runValidators: true }
    )
      .populate("driverAssigned", "name phoneNumber") // Adjust fields as needed
      .populate("routeAssigned");

    res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (error) {
    console.error("Error in updateVehicle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    await emptyTempFolder()
  }
};

// Get single vehicle
exports.getVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id)
      .populate("driverAssigned", "name phoneNumber")
      .populate("routeAssigned", "name");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error retrieving vehicle",
    });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate("driverAssigned", "name phoneNumber")
      .populate("routeAssigned", "name")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error retrieving vehicles",
    });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting vehicle",
    });
  }
};
