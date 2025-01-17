const express = require('express');
const router = express.Router();

// Import the controller functions
const {
    startTest,
    submitTest,
    getSubmissionById,
    getStudentSubmissions,
    getTestSubmissions
} = require("../controllers/submissionController")

// Middleware for authentication
const jwtToken = require('../middlewares/jwtToken');

// Routes
// Start a test attempt
router.post('/start/:testId', jwtToken, startTest);

// Submit a test
router.post('/submit/:submissionId', jwtToken, submitTest);

// Get submission details by ID
router.get('/:id', jwtToken, getSubmissionById);

// Get all submissions for a specific student
router.get('/:studentId', jwtToken, getStudentSubmissions);
router.get('/all/:testId', jwtToken, getTestSubmissions);



module.exports = router;
