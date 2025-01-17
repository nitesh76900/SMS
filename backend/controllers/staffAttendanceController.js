const Staff = require("../models/staffModels");
const StaffAttendance = require("../models/staffAttendanceModels");
const mongoose = require("mongoose"); // Ensure mongoose is imported

exports.getStaffAttendance = async (req, res) => {
  try {
    console.log("getStaffAttendance: Request received with query:", req.query);

    const { date } = req.query;
    console.log("getStaffAttendance: Query date set to:", date);

    // Get all staff members
    console.log("getStaffAttendance: Fetching all staff members...");
    const allStaff = await Staff.find().populate("department");
    console.log(
      "getStaffAttendance: Total staff members found:",
      allStaff.length
    );

    // Get attendance records for the date
    console.log(
      "getStaffAttendance: Fetching attendance records for date:",
      date
    );
    const attendanceRecords = await StaffAttendance.find({
      date,
    }).populate({
      path: "staffId",
      populate: {
        path: "department", // Assuming "department" is a reference field in the staff schema
      },
    });

    console.log(
      "getStaffAttendance: Attendance records fetched:",
      attendanceRecords
    );
    console.log("getStaffAttendance: Attendance records fetched:", allStaff);
    console.log(
      "getStaffAttendance: Attendance records fetched:",
      attendanceRecords
    );

    // Create attendance records for staff without records
    console.log("getStaffAttendance: Preparing attendance records...");
    const staffAttendance = allStaff.map((staff) => {
      // Modified comparison to handle populated staffId
      const existingRecord = attendanceRecords.find((record) => {
        const recordStaffId = record?.staffId._id?.toString();
        return recordStaffId === staff._id.toString();
      });

      if (existingRecord) {
        console.log(
          `getStaffAttendance: Existing attendance found for staff ${staff._id}`
        );
        return existingRecord;
      }

      console.log(
        `getStaffAttendance: No record found for staff ${staff._id}, creating a default record.`
      );
      return {
        _id: new mongoose.Types.ObjectId(),
        staffId: staff,
        date,
        status: "pending",
        entryTime: "",
        remarks: "",
      };
    });

    console.log("getStaffAttendance: Returning attendance records...");
    return res.status(200).json({
      success: true,
      data: staffAttendance,
    });
  } catch (error) {
    console.error("getStaffAttendance: Error occurred:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching attendance records.",
    });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    console.log("updateAttendance: Request received with body:", req.body);

    const { staffId, date, status } = req.body;

    const staff = await Staff.findById(staffId);
    if(!staff || !staff.isActive){
      return res.status(404).json({error: "Staff not found"})
    }

    console.log("updateAttendance: Query date set to:", date);

    console.log("updateAttendance: Checking existing attendance record...");
    let attendance = await StaffAttendance.findOne({
      staffId,
      date,
    });

    const entryTime =
      status === "present"
        ? new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "";

    if (attendance) {
      console.log(
        `updateAttendance: Existing attendance found for staffId ${staffId}, updating record.`
      );
      attendance.status = status;
      attendance.entryTime = entryTime;
      await attendance.save();
    } else {
      console.log(
        `updateAttendance: No attendance found for staffId ${staffId}, creating new record.`
      );
      attendance = await StaffAttendance.create({
        staffId,
        date,
        status,
        entryTime,
      });
    }

    console.log(
      "updateAttendance: Fetching updated attendance record...",
      attendance
    );
    const populatedAttendance = await StaffAttendance.findById(
      attendance._id
    ).populate("staffId");

    console.log("updateAttendance: Returning updated attendance record...");
    return res.status(200).json({
      success: true,
      data: populatedAttendance,
    });
  } catch (error) {
    console.error("updateAttendance: Error occurred:", error);
    return res.status(500).json({
      success: false,
      error: "Error updating attendance.",
    });
  }
};
