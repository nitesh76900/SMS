const Admin = require("../models/adminModels");
const Parents = require("../models/parentModels");
const Student = require("../models/studentModel");
const Teachers = require("../models/teacherModels");
const Department = require("../models/departmentModels");
const Class = require("../models/classModels")
const hashPassword = require("../utils/password");



exports.getProfile = async (req, res) => {
    try {
        let user = req.user;

        // Clone the user object to avoid modifying an immutable object directly
        let updatedUser = { ...user._doc }; // Use `_doc` if `user` is a Mongoose document

        if (user.staffId && user.staffId.department) {
            const department = await Department.findById(user.staffId.department);
            if (department) {
                updatedUser.staffId = {
                    ...user.staffId._doc,
                    departmentName: department.name, // Replace department ObjectId with name
                };
            } else {
                console.log("No department found for the given ID");
            }
        }
        if (user.class) {
            const classData = await Class.findById(user.class);
            if (classData) {
                updatedUser = {
                    ...user._doc,
                    className: classData.name, // Replace class ObjectId with name
                    classSec: classData.section, // Replace class ObjectId with name
                };
            } else {
                console.log("No class found for the given ID");
            }
        }

        console.log("get profile", updatedUser);
        return res.status(200).json({ message: "Get profile", user: updatedUser });
    } catch (error) {
        console.log(error); // Corrected error logging
        return res.status(500).send({
            message: "Internal server error",
        });
    }
};


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