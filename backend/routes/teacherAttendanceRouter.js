const express = require("express");
const router = express.Router();
const {
	addTeacherAttendance,
	getTeacherAttendance,
	getAllTeacherAttendance,
	updateTeacherAttendance,
} = require("../controllers/teacherAttendanceController");


const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
router.post("/",jwtToken, checkAdmin, addTeacherAttendance);
router.get("/:teacherId",jwtToken, getTeacherAttendance);
router.get("/",jwtToken, checkAdmin, getAllTeacherAttendance);
router.put("/:id",jwtToken, checkAdmin, updateTeacherAttendance);

module.exports = router;
