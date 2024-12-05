const express = require("express");
const router = express.Router();
const {
	addStudentMarks,
	getAllStudentMarks,
	getStudentMarksByRegistrationAndDob,
	updateStudentMarks,
} = require("../controllers/studentMarksController");
const jwtToken = require("../middlewares/jwtToken");
const checkTeacher = require("../middlewares/checkTeacher");

// Route to add marks for a student
router.post("/",jwtToken, checkTeacher, addStudentMarks);

// Route to get all students' marks
router.get("/",jwtToken,checkTeacher, getAllStudentMarks);

// Route to get marks for a student by registration number and DOB
router.get("/student/:registrationNumber/:dob",jwtToken, getStudentMarksByRegistrationAndDob);

// Route to update marks for a specific student by ID
router.put("/:studentId",jwtToken, checkTeacher, updateStudentMarks);

module.exports = router;
