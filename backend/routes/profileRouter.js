const express = require("express");
const { getProfile, changePassword } = require("../controllers/userController");
const jwtToken = require("../middlewares/jwtToken");
const router = express.Router();


// Route to add a new notice
router.get("/", jwtToken, getProfile)
router.put("/change-password", jwtToken, changePassword)


module.exports = router;