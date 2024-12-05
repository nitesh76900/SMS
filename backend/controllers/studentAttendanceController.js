const StudentAttendance = require("../models/studentAttendanceModel");

// Add a new student attendance record
exports.addStudentAttendance = async (req, res) => {
  try {
    
    const attendance = await StudentAttendance.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get attendance for a specific student by ID
exports.getStudentAttendance = async (req, res) => {
  try {
    const attendance = await StudentAttendance.find({
      student: req.params.studentId,
    });
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "No attendance found" });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTodayDateRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// Get all students' attendance for today
exports.getAllStudentAttendance = async (req, res) => {
  try {
    const { date } = getTodayDateRange();
    const attendanceRecords = await StudentAttendance.find({
      date,
    }).populate("student", "name rollNumber");

    res.status(200).json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve today's attendance",
      error: error.message,
    });
  }
};

// Get all students' attendance for today, filtered by class
exports.getAllClassStudentAttendance = async (req, res) => {
  const { classID } = req.params; // Assuming the class name is passed in the URL params

  try {
    const { startOfDay, endOfDay } = getTodayDateRange();
    const attendanceRecords = await StudentAttendance.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    }).populate({
      path: "student",
      match: { class: classID }, // Filter by class in the populated student field
      select: "name rollNumber class",
    });

    // Filter out records where the student doesn't match the class filter
    const filteredRecords = attendanceRecords.filter(
      (record) => record.student !== null
    );

    res.status(200).json({
      success: true,
      data: filteredRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve today's attendance for class ${className}`,
      error: error.message,
    });
  }
};

// Update a student's attendance record
exports.updateStudentAttendance = async (req, res) => {
  try {
    const attendance = await StudentAttendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const totalStudents = await Student.countDocuments();
    
    const attendanceData = await StudentAttendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          presentCount: { $sum: 1 },
          totalStudents: { $first: totalStudents }
        }
      }
    ]);

    res.status(200).json(attendanceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMonthlyAttendanceByClass = async (req, res) => {
  try {
    const { year, month, classId } = req.params;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const totalStudents = await Student.countDocuments();
    
    const attendanceData = await StudentAttendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          },
          "Student.class" : classId
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          presentCount: { $sum: 1 },
          totalStudents: { $first: totalStudents }
        }
      }
    ]);

    res.status(200).json(attendanceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};