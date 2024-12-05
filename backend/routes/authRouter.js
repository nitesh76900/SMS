const express = require("express");
const { login, logout } = require("../controllers/authController");
const { addAdmin } = require("../controllers/adminController");
const router = express.Router();


// Route to add a new notice
router.post("/login", login);
router.get("/logout", logout);
router.post("/createAdmin", addAdmin);

module.exports = router;