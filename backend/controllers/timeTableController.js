// Importing the TimeTable model
const TimeTable = require("../models/timeTableModels");
const Teacher = require("../models/teacherModels");

// Helper function to handle validation errors
const handleValidationErrors = (error) => {
  if (error.name === "ValidationError") {
    return Object.values(error.errors).map((err) => err.message);
  }
  return [error.message];
};

// Add a new timetable
exports.addTimeTable = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { classId, day, periods } = req.body;

    const existTimeTable = await TimeTable.findOne({ class: classId, day });
    if (existTimeTable)
      return res.status(400).json({
        error: "This Class Time Table are already exist in same day.",
      });

    // Create new timetable entry
    const timetable = await TimeTable.create({
      class: classId,
      day,
      periods,
    });

    // Return success message and data
    return res
      .status(201)
      .json({ message: "Timetable created successfully", data: timetable });
  } catch (error) {
    const errors = handleValidationErrors(error);
    return res.status(400).json({ error: errors });
  }
};

// Get timetable by class
exports.getClassTimeTable = async (req, res) => {
  try {
    const { classId } = req.params;

    const timetable = await TimeTable.find({ class: classId })
      .populate("class")
      .populate("periods.teacher");

    if (!timetable || timetable.length === 0) {
      return res
        .status(404)
        .json({ error: "No timetable found for this class." });
    }

    // Return success message and data
    res
      .status(200)
      .json({ message: "Timetable retrieved successfully", data: timetable });
  } catch (error) {
    const errors = handleValidationErrors(error);
    res.status(400).json({ error: errors });
  }
};

exports.getTimetableById = async (req, res) => {
  try {
    console.log("req.params", req.params);
    const { id } = req.params;
    const timetable = await TimeTable.findById(id)
      .populate("class", "name") // Adjust as per your `Class` schema
      .populate("periods.teacher", "name"); // Adjust as per your `Teacher` schema

    console.log("timetable", timetable);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    res.status(200).json(timetable);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a timetable
exports.updateTimeTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const timetable = await TimeTable.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    // Return success message and data
    return res
      .status(200)
      .json({ message: "Timetable updated successfully", data: timetable });
  } catch (error) {
    const errors = handleValidationErrors(error);
    return res.status(400).json({ errors });
  }
};

// Delete a timetable
exports.deleteTimeTable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await TimeTable.findByIdAndDelete(id);

    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    // await Return success message without data
    return res.status(200).json({ message: "Timetable deleted successfully" });
  } catch (error) {
    const errors = handleValidationErrors(error);
    return res.status(400).json({ error, message: errors });
  }
};

// Get timetable by teacher
exports.getTeacherTimeTable = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const timetable = await TimeTable.find({ "periods.teacher": teacherId })
      .populate("class")
      .populate("periods.teacher");

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this teacher.",
      });
    }

    // Return success message and data
    return res.status(200).json({
      success: true,
      message: "Timetable retrieved successfully",
      data: timetable,
    });
  } catch (error) {
    const errors = handleValidationErrors(error);
    return res.status(400).json({ errors });
  }
};

exports.getTodayTimeTable = async (req, res) => {
  try {
    // Get today's day name
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayDay = daysOfWeek[new Date().getDay()]; // e.g., 'Monday'

    console.log(todayDay);

    // Find timetables for today
    const timetable = await TimeTable.find({ day: todayDay })
      .populate("class")
      .populate("periods.teacher");

    if (!timetable || timetable.length === 0) {
      return res
        .status(404)
        .json({ error: `No timetable found for ${todayDay}.` });
    }

    // Return today's timetable with a success message
    return res
      .status(200)
      .json({ message: `Timetable for ${todayDay}`, data: timetable });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
exports.findFreeTeacher = async (req, res) => {
  try {
    console.log('req.body in find free teachers', req.body)
    const { day, periodNumber,classId="" } = req.body;

    // Validate input
    if (!day || !periodNumber) {
      return res.status(400).json({
        error: "Both day and periodNumber are required.",
      });
    }

    // Find all teachers assigned to the specific period on the given day
    const assignedTeachers = await TimeTable.find({
      day,
      periods: {
        $elemMatch: {
          periodNumber: periodNumber
        }
      }
    }).select('periods');

    // Extract teacher IDs who are assigned during this specific period
    const assignedTeacherIds = new Set(
      assignedTeachers.flatMap(timetable =>
        timetable.periods
          .filter(period => period.periodNumber === periodNumber)
          .map(period => period.teacher.toString())
      )
    );

    // Find teachers who are not assigned during this period
    const freeTeachers = await Teacher.find({
      _id: { $nin: Array.from(assignedTeacherIds) }
    }).select("name subject");
  console.log('freeTeachers', freeTeachers)
    return res.status(200).json({
      message: "Free teachers retrieved successfully.",
      freeTeachers,
    });
  } catch (error) {
    console.error("Error finding free teachers:", error);
    return res.status(500).json({
      error: "An error occurred while finding free teachers.",
    });
  }
};