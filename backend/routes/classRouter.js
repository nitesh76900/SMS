const express = require("express");
const jwtToken = require("../middlewares/jwtToken");
const router = express.Router();
const {getAllClass, getAllClassById} = require("../controllers/classController");
// const checkTeacher = require("../middlewares/checkTeacher");


// Route to add a new notice
router.get("/", jwtToken, getAllClass);
router.get("/:id", jwtToken, getAllClassById);

module.exports = router;