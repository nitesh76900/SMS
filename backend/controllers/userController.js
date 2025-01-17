const Admin = require("../models/adminModels");
const Parents = require("../models/parentModels");
const Student = require("../models/studentModel");
const Teachers = require("../models/teacherModels");
const hashPassword = require("../utils/password");



exports.getProfile = async (req, res) => {
    try {
        const user = req.user
        console.log("get profile",user)
        return res.status(200).json({ message: "Get profile", user })
    } catch (error) {
        console.log(err);
        return res.status(500).send({
            message: "Internel server error",
        });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { newPassword, oldPassword } = req.body
        const role = req.user.role
        const userData = (role === "teacher") ?
            await Teachers.findById(req.user._id) :
            (role === "student") ?
                await Student.findById(req.user._id) :
                (role === "parent") ?
                    await Parents.findById(req.user._id) :
                    await Admin.findById(req.user._id);

        const matchPassword = await bcrypt.compare(oldPassword, userData.password)
        if (!matchPassword) return res.status(400).json({ error: "Invalid password" });
        userData.password = await hashPassword(newPassword);
        await userData.save();
        return res.status(200).json({message: "password changed!"})
    } catch (error) {
        console.log(err);
        return res.status(500).send({
            message: "Internel server error",
        });
    }
}