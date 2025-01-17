const express = require("express");
const router = express.Router();
const jwtToken = require("../middlewares/jwtToken");
const checkTeacher = require("../middlewares/checkTeacher")
const {getDashboardStats} = require("../controllers/teacherDashboardController")

router.use(jwtToken);

// Routes for dashboard statistics
router.get("/", checkTeacher, getDashboardStats);

module.exports = router;
