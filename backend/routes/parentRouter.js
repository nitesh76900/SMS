const express = require("express");
const router = express.Router();
const {
  getAllParents,
  getParentById,
  updateParent,
  getParentByStudentId,
} = require("../controllers/parentController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const checkTeacher = require("../middlewares/checkTeacher");

router.get("/", jwtToken, checkTeacher, getAllParents); // Route to get all parents
router.get("/student/:id", jwtToken, checkAdmin, getParentByStudentId); // Route to update a specific parent by ID
router.get("/:id", jwtToken, checkAdmin, getParentById); // Route to get a specific parent by ID
router.put("/:id", jwtToken, checkAdmin, updateParent); // Route to update a specific parent by ID

module.exports = router;
