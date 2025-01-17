const express = require("express");
const router = express.Router();
const {
  getAllLiveSessions,
  getLiveSessionById,
  createLiveSession,
  updateLiveSession,
  updateSessionStatus,
  deleteLiveSession
} = require("../controllers/liveSessionController");
const jwtToken = require("../middlewares/jwtToken");
const checkTeacher = require("../middlewares/checkTeacher");

router.get("/", jwtToken, getAllLiveSessions);                    // Get all live sessions
router.get("/:id", jwtToken, getLiveSessionById);                 // Get specific live session
router.post("/", jwtToken, checkTeacher, createLiveSession);      // Create new live session
router.put("/:id", jwtToken, checkTeacher, updateLiveSession);    // Update live session
router.patch("/status/:id", jwtToken, checkTeacher, updateSessionStatus); // Update session status
router.delete("/:id", jwtToken, checkTeacher, deleteLiveSession); // Delete live session

module.exports = router;