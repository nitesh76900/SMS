const express = require("express");
const router = express.Router();
const {
  getAllTeachers,
  getTeacherById,
  updateTeacher,
} = require("../controllers/teacherController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const checkTeacher = require("../middlewares/checkTeacher");

router.get("/", jwtToken, getAllTeachers); // Route to get all teachers
router.get("/:id", jwtToken, checkTeacher, getTeacherById); // Route to get a specific teacher by ID
router.put("/:id", jwtToken, checkAdmin, updateTeacher); // Route to update a specific teacher by ID

module.exports = router;
