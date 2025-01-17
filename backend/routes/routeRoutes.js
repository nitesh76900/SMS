const express = require("express");
const router = express.Router();
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const {createRoute,updateRoute, getRoute, getAllRoutes} = require("../controllers/routeController")


router.post("/",jwtToken, checkAdmin, createRoute);
router.put("/:id",jwtToken, checkAdmin, updateRoute);
router.get("/:id",jwtToken, getRoute);
router.get("/",jwtToken, getAllRoutes);


module.exports = router;
