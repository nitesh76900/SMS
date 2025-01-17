const express = require("express");
const router = express.Router();
const jwtToken = require("../middlewares/jwtToken");
const { addVehicleHistory,updateVehicleHistoryStop,getVehicleHistories } = require("../controllers/vehicleHistoryController");


router.post("/",jwtToken, addVehicleHistory);
router.put("/",jwtToken, updateVehicleHistoryStop);
router.get('/', jwtToken, getVehicleHistories);


module.exports = router;
