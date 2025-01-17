const express = require("express");
const router = express.Router();
const {
  createTest,
  getAllTests,
  getTestById,
  updateTestById,
  deleteTestById,
  addQuestionsToTest
} = require("../controllers/testController");
const protect = require("../middlewares/jwtToken");
const jwtToken = require("../middlewares/jwtToken");
const checkTeacher = require("../middlewares/checkTeacher");

// Create new test - only teachers and admins can create tests
router.post("/",jwtToken, checkTeacher, createTest);

// Get all tests - accessible to authenticated users
router.get("/",jwtToken, getAllTests);

// Get specific test by ID
router.get("/:id",jwtToken, getTestById);

// Update test - only teachers who created the test and admins can update
// router.put("/:id", updateTestById);

// // Delete test - only teachers who created the test and admins can delete
// router.delete("/:id", deleteTestById);

// Add Test Questions
router.post("/:id/questions",jwtToken, checkTeacher, addQuestionsToTest);

module.exports = router;
