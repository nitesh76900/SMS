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

// Protect all routes - require authentication
router.use(protect);

// Create new test - only teachers and admins can create tests
router.post("/", createTest);

// Get all tests - accessible to authenticated users
router.get("/", getAllTests);

// Get specific test by ID
router.get("/:id", getTestById);

// Update test - only teachers who created the test and admins can update
// router.put("/:id", updateTestById);

// // Delete test - only teachers who created the test and admins can delete
// router.delete("/:id", deleteTestById);

// Add Test Questions
router.post("/:id/questions", addQuestionsToTest);

module.exports = router;
