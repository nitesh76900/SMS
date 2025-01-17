const express = require("express");
const { addStaff, updateStaff, getStaff, getAllStaff, getStaffByDepartment, deleteStaff, changeRole, addDepartment } = require("../controllers/staffController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const router = express.Router();


// Route to add a new notice

router.post("/department", jwtToken, checkAdmin, addDepartment);
// => /department/:departmetId
router.get("/department/:id", jwtToken, checkAdmin, getStaffByDepartment);
// => /staffId
router.get("/:id", jwtToken, checkAdmin, getStaff);
router.get("/", jwtToken, checkAdmin, getAllStaff);
router.post("/", jwtToken, checkAdmin, addStaff);
// => /department/:staffId
router.put("/department/:id", jwtToken, checkAdmin, changeRole);
// => /:staffId
router.put("/:id", jwtToken, checkAdmin, updateStaff);
// => /:staffId
router.delete("/:id", jwtToken, checkAdmin, deleteStaff);


module.exports = router;