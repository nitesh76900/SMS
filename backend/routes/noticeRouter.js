const express = require("express");
const upload = require('../middlewares/multer'); // Middleware to handle file uploads
const router = express.Router();
const {
	addNotice,
	getAllNotices,
	updateNotice,
	deleteNotice,
} = require("../controllers/noticeController");
const jwtToken = require("../middlewares/jwtToken");
const checkAdmin = require("../middlewares/checkAdmin");


router.post("/",jwtToken,checkAdmin,upload.single('image'), addNotice);
router.get("/",jwtToken, getAllNotices);
router.put("/:id",jwtToken,checkAdmin,upload.single('image'), updateNotice);
router.delete("/:id",jwtToken,checkAdmin, deleteNotice);

module.exports = router;
