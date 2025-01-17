const express = require("express");
const {
  getTimetableById,
  addTimeTable,
  getClassTimeTable,
  updateTimeTable,
  deleteTimeTable,
  getTeacherTimeTable,
  getTodayTimeTable,
  findFreeTeacher,
} = require("../controllers/timeTableController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const checkTeacher = require("../middlewares/checkTeacher");
const router = express.Router();

router.post("/", jwtToken, checkAdmin, addTimeTable);
router.get("/class/:classId", jwtToken, getClassTimeTable);
router.put("/:id", jwtToken, checkAdmin, updateTimeTable);
router.delete("/:id", jwtToken, checkAdmin, deleteTimeTable);
router.get("/teacher/:teacherId", jwtToken, checkTeacher, getTeacherTimeTable);
router.get("/today", jwtToken, getTodayTimeTable);
router.get("/:id", jwtToken, getTimetableById);
router.post("/find-free-teacher", jwtToken,checkAdmin, findFreeTeacher);

module.exports = router;
