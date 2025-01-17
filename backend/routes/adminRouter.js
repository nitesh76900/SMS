const express = require("express");
const { addAdmin, addTeacher, addClass, studentAddmission, updateParentAndStudent } = require("../controllers/adminController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");
const router = express.Router();


// Route to add a new notice
router.post("/add-admin", jwtToken, checkAdmin, addAdmin);
router.post("/add-teacher", jwtToken, checkAdmin, addTeacher);
router.post("/add-class", jwtToken, checkAdmin, addClass);
router.post("/new-addmission", jwtToken, checkAdmin, studentAddmission);
router.put("/update-student-data/:id", jwtToken, checkAdmin, updateParentAndStudent);


module.exports = router;