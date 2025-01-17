const express = require("express");
const router = express.Router();
const jwtToken = require("../middlewares/jwtToken");
const {
  addVehicle,
  updateVehicle,
  getVehicle,
  getAllVehicles,
  deleteVehicle,
} = require("../controllers/VehicleController");
const checkAdmin = require("../middlewares/checkAdmin");
const upload = require("../middlewares/multer");

router.post("/", upload.single("image"), jwtToken, checkAdmin, addVehicle);
router.put("/:id", upload.single("image"), jwtToken, checkAdmin, updateVehicle);
router.get("/:id", jwtToken, getVehicle);
router.get("/", jwtToken, getAllVehicles);
router.delete("/:id", jwtToken, checkAdmin, deleteVehicle);

module.exports = router;
