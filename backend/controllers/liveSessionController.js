const LiveSession = require("../models/LiveSession");

// Get all live sessions
const getAllLiveSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find()
      .populate("teacher", "name email")
      .populate("class", "name section")
      .sort("-startFrom");

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get live session by ID
const getLiveSessionById = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id)
      .populate("teacher")
      .populate("students")
      .populate("class");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found",
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new live session
const createLiveSession = async (req, res) => {
  try {
    console.log("Live Session Data:", req.body);
    // Check for overlapping sessions
    const { startFrom, duration, teacher } = req.body;
    const sessionEnd = new Date(
      new Date(startFrom).getTime() + duration * 60000
    );

    const overlappingSession = await LiveSession.findOne({
      teacher,
      startFrom: { $lt: sessionEnd },
      $expr: {
        $lt: [
          {
            $subtract: [
              { $add: ["$startFrom", { $multiply: ["$duration", 60000] }] },
              new Date(startFrom),
            ],
          },
          duration * 60000,
        ],
      },
    });

    if (overlappingSession) {
      return res.status(400).json({
        success: false,
        message: "This time slot overlaps with another session",
      });
    }

    const session = await LiveSession.create(req.body);

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update live session
const updateLiveSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found",
      });
    }

    // Prevent updating status through this route
    if (req.body.status) {
      return res.status(400).json({
        success: false,
        message: "Please use the dedicated status update route",
      });
    }

    const updatedSession = await LiveSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update session status
const updateSessionStatus = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    console.log("req.params.id", session);
    console.log("req.body", req.body);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found",
      });
    }

    const validTransitions = {
      scheduled: ["ongoing", "cancelled"],
      ongoing: ["completed"],
      completed: [],
      cancelled: [],
    };
    console.log(
      "validTransitions[session.status]",
      validTransitions[session.status]
    );
    console.log(
      "validTransitions[session.status].includes(req.body.status)",
      !validTransitions[session.status].includes(req.body.status)
    );
    if (!validTransitions[session.status].includes(req.body.status)) {
      console.log("checked");

      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${session.status} to ${req.body.status}`,
      });
    }

    session.status = req.body.status;
    await session.save();

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete live session
const deleteLiveSession = async (req, res) => {
  try {
    console.log("req.params.id", req.params.id);
    const session = await LiveSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an ongoing or completed session",
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: "Live session deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllLiveSessions,
  getLiveSessionById,
  createLiveSession,
  updateLiveSession,
  updateSessionStatus,
  deleteLiveSession,
};
