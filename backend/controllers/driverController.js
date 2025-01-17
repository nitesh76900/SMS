const { default: mongoose } = require("mongoose");
const Department = require("../models/departmentModels");
const Driver = require("../models/DriverModel");
const Staff = require("../models/staffModels");
const generateUniqueId = require("../utils/generateId");
const hashPassword = require("../utils/password");
const uploadOnCloudinary = require("../utils/cloudinary");
const emptyTempFolder = require("../utils/emptyTempFolder");

// Add a new driver
exports.addDriver = async (req, res) => {
  console.log("req.body in add driver", req.body);
  const session = await mongoose.startSession();

  try {
    const {
      licenseNumber,
      experience,
      dateOfBirth,
      licenseExpiryDate,
      name,
      email,
      phoneNo,
      salary,
      address,
      govId,
    } = req.body;

    if (
      !licenseNumber ||
      !experience ||
      !dateOfBirth ||
      !licenseExpiryDate ||
      !name ||
      !email ||
      !phoneNo ||
      !salary ||
      !address ||
      !govId
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    if (
      (await Driver.findOne({ licenseNumber })) ||
      (await Staff.findOne({ $or: [{ email }, { phoneNo }, { govId }] }))
    ) {
      return res.status(400).json({ error: "Staff details already exist." });
    }

    // Start the transaction
    session.startTransaction();

    // Ensure "Transport" department exists
    let department = await Department.findOne({ name: "Transport" }).session(
      session
    );
    if (!department) {
      department = await Department.create([{ name: "Transport" }], {
        session,
      });
      department = department;
    }

    let imageResponse;
    if (req.file) {
      // Assuming `req.file` contains the uploaded file
      imageResponse = await uploadOnCloudinary(req.file.path);
      if (!imageResponse) {
        return res.status(500).json({
          error: "Error uploading image to Cloudinary",
        });
      }
    }

    // Create staff record
    const staff = await Staff.create(
      [
        {
          name,
          email,
          joinDate: Date.now(),
          phoneNo,
          department: department._id,
          salary,
          address,
          govId,
        },
      ],
      { session }
    );
    const createdStaff = staff;

    // console.log("Created Staff:", createdStaff[0]);
    const staffId = createdStaff[0]._id;
    console.log("Extracted Staff ID:", staffId);

    // Generate unique registration number and hash the password
    const uniqueId = `D${await generateUniqueId()}`;
    const hashedPassword = await hashPassword(uniqueId);

    console.log("Generated unique ID:", uniqueId);
    console.log("Hashed password:", hashedPassword);

    console.log("Payload for Driver.create:", {
      licenseNumber,
      experience,
      dateOfBirth,
      licenseExpiryDate,
      staffId: createdStaff[0]._id,
      registrationNumber: uniqueId,
      password: hashedPassword,
    });

    if (!session.inTransaction()) {
      console.error("Session is not active. Transaction aborted.");
    }

    // Create driver record
    const newDriver = await Driver.create(
      [
        {
          licenseNumber,
          experience,
          dateOfBirth,
          licenseExpiryDate,
          staffId: createdStaff[0]._id,
          registrationNumber: uniqueId,
          password: hashedPassword,
          img: imageResponse
            ? {
              public_id: imageResponse.public_id,
              url: imageResponse.url,
            }
            : undefined,
        },
      ],
      { session }
    );

    console.log("newDriver", newDriver);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json({ message: "Driver added successfully.", data: newDriver });
  } catch (error) {
    // Abort the transaction on error
    console.log("500", error);
    await session.abortTransaction();
    session.endSession();

    return res
      .status(500)
      .json({ message: "Failed to add driver.", error: error.message });
  } finally {
    await emptyTempFolder()
  }
};

// Update driver details
exports.updateDriver = async (req, res) => {
  console.log("req.body in update driver", req.body);
  const session = await mongoose.startSession();

  try {
    const driverId = req.params.id; // Assuming the driver ID is passed in the URL
    const {
      licenseNumber,
      experience,
      dateOfBirth,
      licenseExpiryDate,
      name,
      email,
      phoneNo,
      salary,
      address,
      govId,
    } = req.body;

    // Validate required fields
    if (
      !licenseNumber ||
      !experience ||
      !dateOfBirth ||
      !licenseExpiryDate ||
      !name ||
      !email ||
      !phoneNo ||
      !salary ||
      !address ||
      !govId
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    // Find existing driver
    const existingDriver = await Driver.findById(driverId);
    if (!existingDriver) {
      return res.status(404).json({ error: "Driver not found." });
    }

    // Check for duplicate entries excluding current driver/staff
    const duplicateCheck = await Promise.all([
      Driver.findOne({
        licenseNumber,
        _id: { $ne: driverId },
      }),
      Staff.findOne({
        $or: [{ email }, { phoneNo }, { govId }],
        _id: { $ne: existingDriver.staffId },
      }),
    ]);

    if (duplicateCheck[0] || duplicateCheck[1]) {
      return res.status(400).json({ error: "Staff details already exist." });
    }

    // Start the transaction
    session.startTransaction();

    // Handle image upload if new image is provided
    let imageUpdate = {};
    if (req.file) {
      const imageResponse = await uploadOnCloudinary(req.file.path);
      if (!imageResponse) {
        return res.status(500).json({
          error: "Error uploading image to Cloudinary",
        });
      }

      // Delete old image from Cloudinary if it exists
      if (existingDriver.img?.public_id) {
        await cloudinary.uploader.destroy(existingDriver.img.public_id);
        console.log("Delete Image");
      }

      imageUpdate = {
        img: {
          public_id: imageResponse.public_id,
          url: imageResponse.url,
        },
      };
    }

    // Update staff record
    const updatedStaff = await Staff.findByIdAndUpdate(
      existingDriver.staffId,
      {
        name,
        email,
        phoneNo,
        salary,
        address,
        govId,
      },
      { new: true, session }
    );

    if (!updatedStaff) {
      throw new Error("Failed to update staff record");
    }

    // Update driver record
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      {
        licenseNumber,
        experience,
        dateOfBirth,
        licenseExpiryDate,
        ...imageUpdate,
      },
      { new: true, session }
    );

    if (!updatedDriver) {
      throw new Error("Failed to update driver record");
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Driver updated successfully.",
      data: updatedDriver,
    });
  } catch (error) {
    // Abort the transaction on error
    console.log("500", error);
    await session.abortTransaction();
    session.endSession();

    return res
      .status(500)
      .json({ message: "Failed to update driver.", error: error.message });
  } finally {
    await emptyTempFolder()
  }
};

// Get driver details
exports.getDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id).populate(
      "staffId assignedVehicle"
    );
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    res.status(200).json({ data: driver });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve driver.", error: error.message });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("staffId assignedVehicle");
    console.log("drivers", drivers);
    res.status(200).json({ data: drivers });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to retrieve drivers.", error: error.message });
  }
};
