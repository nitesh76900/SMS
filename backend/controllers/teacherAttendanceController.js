const TeacherAttendance = require("../models/teacherAttendanceModel");
const Teachers = require("../models/teacherModels");

// Add a new teacher attendance record
exports.addTeacherAttendance = async (req, res) => {
  console.log("Starting addTeacherAttendance function");
  // console.log('Request body:', req.body);

  try {
    const attendanceData = {
      teacher: req.body.teacher,
      date: req.body.date || new Date(),
      status: req.body.status || "pending",
      entryTime: req.body.entryTime || "",
    };

    const teacherOrNot = await Teachers.findById(
      attendanceData.teacher
    ).populate("staffId");
    if (!teacherOrNot || !teacherOrNot.staffId.isActive) {
      return res.status(404).json({ error: "teacher not found" });
    }

    console.log("Processed attendance data:", attendanceData);

    const attendance = await TeacherAttendance.create(attendanceData);
    console.log("Successfully created attendance record:", attendance);

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error in addTeacherAttendance:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get attendance for a specific teacher by ID
exports.getTeacherAttendance = async (req, res) => {
  console.log("Starting getTeacherAttendance function");
  console.log("Teacher ID:", req.params.teacherId);

  try {
    const attendance = await TeacherAttendance.find({
      teacher: req.params.teacherId,
    }).sort({ date: -1 }); // Sort by date in descending order

    console.log(`Found ${attendance.length} attendance records`);

    if (!attendance || attendance.length === 0) {
      console.log("No attendance records found");
      return res
        .status(404)
        .json({ success: false, message: "No attendance found" });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error in getTeacherAttendance:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all teacher attendance records
exports.getAllTeacherAttendance = async (req, res) => {
  console.log("Starting getAllTeacherAttendance function");

  try {
    const query = {};

    // Add optional filters based on query parameters

    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.date) {
      query.date = new Date(req.query.date);
    }

    console.log("Query filters:", query);

    const attendanceRecords = await TeacherAttendance.find(query)
      .sort({ date: -1 })
      .populate("teacher", "name email"); // Populate teacher details if needed

    console.log(`Found ${attendanceRecords.length} total attendance records`);

    res.status(200).json({ success: true, data: attendanceRecords });
  } catch (error) {
    console.error("Error in getAllTeacherAttendance:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a teacher's attendance record
exports.updateTeacherAttendance = async (req, res) => {
  console.log("Starting updateTeacherAttendance function");
  console.log("Attendance ID:", req.params.id);
  console.log("Update data:", req.body);

  try {
    const updateData = {
      status: req.body.status,
      entryTime: req.body.entryTime,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    console.log("Processed update data:", updateData);

    const attendance = await TeacherAttendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!attendance) {
      console.log("Attendance record not found");
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    console.log("Successfully updated attendance record:", attendance);
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error in updateTeacherAttendance:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
