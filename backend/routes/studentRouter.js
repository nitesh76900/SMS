const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const jwtToken = require("../middlewares/jwtToken");
const checkTeacher = require("../middlewares/checkTeacher");
const checkAdmin = require("../middlewares/checkAdmin");

router.post("/fee-payment",jwtToken, checkAdmin, studentController.addFeePayment);
router.get("/receipt",jwtToken, checkAdmin, studentController.getAllReceipt);
router.get("/receipt/student/:id",jwtToken, checkAdmin, studentController.getAllReceiptByStudent);
router.get("/receipt/:id",jwtToken, checkAdmin, studentController.getAllReceiptById);
router.get("/fee/reminder-by-email/:id",jwtToken, checkAdmin, studentController.feeReminderByEmail);
router.get("/student-by-class/:id",jwtToken,checkTeacher, studentController.getStudentByClass);
// Get all students
router.get("/",jwtToken,checkTeacher, studentController.getAllStudents);

// Get student by ID
router.get("/:id",jwtToken,checkTeacher, studentController.getStudentById);

// Update student by ID
router.put("/:id",jwtToken, checkAdmin, studentController.updateStudentById);

// Delete student by ID
router.delete("/:id",jwtToken, checkAdmin, studentController.deleteStudentById);

module.exports = router;
