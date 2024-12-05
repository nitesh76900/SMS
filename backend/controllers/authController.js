const Admin = require("../models/adminModels");
const Parents = require("../models/parentModels");
const Student = require("../models/studentModel");
const Teachers = require("../models/teacherModels");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.login = async (req, res) => {
    try {
        const { loginId, password } = req.body
        if(!loginId || !password) return res.status(400).json({error: "All fields are required."})
        const userData = (loginId[0] === "A") ?
            (await Admin.findOne({ registrationNumber: loginId }).select("+password")) :
            (loginId[0] === "T") ?
                (await Teachers.findOne({ registrationNumber: loginId }).select("+password")) :
                (loginId[0] === "S") ?
                    (await Student.findOne({ registrationNumber: loginId }).select("+password")) :
                    (await Parents.findOne({ registrationNumber: loginId }).select("+password"))
        console.log("user", userData)
        if (!userData) return res.status(400).json({ error: "Invalid credentials" });
        const matchPassword = await bcrypt.compare(password, userData.password)
        if (!matchPassword) return res.status(400).json({ error: "Invalid credentials" });
        const token = await generateToken(userData._id, loginId)
        if (!token) return res.status(500).json({ error: "error in generate token, try again" });
        const expirationTime = 24 * 60 * 60 * 1000;
        res.cookie("token", token, {
            maxAge: expirationTime,
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });
        return res.status(200).json({ message: "Login successfully!", token ,userData})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}


exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    return res.status(200).send({
      message: "log out successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: "Internel server error",
    });
  }
};
