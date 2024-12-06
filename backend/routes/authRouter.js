const express = require("express");
const { login, logout,createAdmin } = require("../controllers/authController");
const { addAdmin } = require("../controllers/adminController");
const router = express.Router();


// Route to add a new notice
router.post("/login", login);
router.get("/logout", logout);
router.post("/createAdmin", createAdmin);

module.exports = router;