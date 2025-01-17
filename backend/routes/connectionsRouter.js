const express = require("express");
const router = express.Router();
const {
	addConnection,
	getAllConnections,
	getConnectionById,
	updateConnection,
	deleteConnection,
} = require("../controllers/connectionsController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const checkTeacher = require("../middlewares/checkTeacher");

// Route to add a new connection
router.post("/", jwtToken, checkAdmin, addConnection);

// Route to get all connections
router.get("/", jwtToken, checkTeacher, getAllConnections);

// Route to get a specific connection by ID
router.get("/:id",jwtToken, checkTeacher, getConnectionById);

// Route to update a connection by ID
router.put("/:id", jwtToken,checkAdmin, updateConnection);

// Route to delete a connection by ID
router.delete("/:id",jwtToken, checkAdmin, deleteConnection);

module.exports = router;
