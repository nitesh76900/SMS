const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/adminDashboardController");; // Assuming you have auth middleware
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
router.use(jwtToken);
// Routes for dashboard statistics
router.get("/stats", checkAdmin, dashboardController.getDashboardStats);

router.post("/stats/update", checkAdmin, dashboardController.updateDashboardStats);

module.exports = router;
