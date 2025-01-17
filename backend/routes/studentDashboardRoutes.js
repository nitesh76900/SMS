const express = require("express");
const router = express.Router();
const jwtToken = require("../middlewares/jwtToken");
const { getStudentDashboardData } = require("../controllers/studentDashboardController");

router.use(jwtToken);

// Routes for dashboard statistics
router.get("/", getStudentDashboardData);

module.exports = router;
