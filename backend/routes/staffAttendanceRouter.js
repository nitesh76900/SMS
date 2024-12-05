const express = require("express");
const { 
    getStaffAttendance, 
    updateAttendance 
} = require("../controllers/staffAttendanceController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const router = express.Router();

router.get("/", jwtToken, checkAdmin, getStaffAttendance);
router.post("/update", jwtToken, checkAdmin, updateAttendance);

module.exports = router;