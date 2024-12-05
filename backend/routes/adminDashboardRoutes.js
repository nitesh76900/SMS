const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/adminDashboardController");
const checkadmin = require("../middlewares/checkAdmin"); // Assuming you have auth middleware
const jwtToken = require("../middlewares/jwtToken");
router.use(jwtToken);
router.use(checkadmin);
// Routes for dashboard statistics
router.get("/stats", dashboardController.getDashboardStats);

router.post("/stats/update", dashboardController.updateDashboardStats);

module.exports = router;
