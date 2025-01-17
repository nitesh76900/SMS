const express = require("express");
const router = express.Router();
const {
	addStudentAttendance,
	getStudentAttendance,
	getAllStudentAttendance,
	updateStudentAttendance,
	getAllClassStudentAttendance,
	getMonthlyAttendance,
	getMonthlyAttendanceByClass
} = require("../controllers/studentAttendanceController");
const jwtToken = require("../middlewares/jwtToken");
const checkTeacher = require("../middlewares/checkTeacher");
const checkAdmin = require("../middlewares/checkAdmin");

// Add student attendance
router.post("/",jwtToken,checkTeacher, addStudentAttendance);

// Get attendance records for a specific student
router.get("/monthly/:year/:month",jwtToken, checkTeacher, getMonthlyAttendance);
router.get("/monthly-class/:year/:month/:class",jwtToken, checkTeacher, getMonthlyAttendanceByClass);
router.get("/:studentId",jwtToken, getStudentAttendance);

// Get all student attendance records
router.get("/all-students-attendance",jwtToken,checkTeacher, getAllStudentAttendance);
router.get("/attendance/:classID",jwtToken,checkTeacher, getAllClassStudentAttendance);

// Update an attendance record by ID
router.put("/:id",jwtToken, checkTeacher, updateStudentAttendance);

module.exports = router;
