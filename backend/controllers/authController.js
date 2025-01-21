const Admin = require("../models/adminModels");
const Parents = require("../models/parentModels");
const Student = require("../models/studentModel");
const Teachers = require("../models/teacherModels");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const Staff = require("../models/staffModels");
const generateUniqueId = require("../utils/generateId");
const hashPassword = require("../utils/password");
const { registrationEmail } = require("../utils/html/html");
const Connections = require("../models/connectionModels");
const sendEmail = require("../utils/sendMail");
const Department = require("../models/departmentModels")

exports.createAdmin = async (req, res) => {
  console.log("Received request to add admin:", req.body);
  try {
    const {
      name,
      phoneNo,
      joinDate,
      email,
      role,
      position,
      salary,
      govId,
      address,
    } = req.body;

    // Validation
    console.log("Validating admin data...");
    if (
      !name ||
      !phoneNo ||
      !joinDate ||
      !email ||
      !position ||
      !salary ||
      !govId ||
      !address
    ) {
      console.log("Validation failed: All fields are required.");
      return res.status(400).json({ error: "All fields are required." });
    }
    if (await Staff.findOne({ email })) {
      console.log("Validation failed: Email already used by staff");
      return res.status(400).json({ error: "Email already used by staff" });
    }
    if (await Staff.findOne({ govId })) {
      console.log("Validation failed: govId already used by staff");
      return res.status(400).json({ error: "govId already used by staff" });
    }

    const uId = `A${await generateUniqueId()}`;
    console.log("Generated unique ID for admin:", uId);

    const encryptPassword = await hashPassword(uId);
    if (!encryptPassword) {
      console.log("Error: hash password failed");
      return res.status(500).json({ error: "hash password failed" });
    }

    const department = await Department.findOne({ name: "Administration" });
    if (!department) {
      console.log("Error: Department not created");
      return res.status(400).json({ error: "Department not created" });
    }

    const staff = new Staff({
      name,
      email,
      phoneNo,
      joinDate,
      position,
      department: department._id,
      teacherOrAdmin: "SuperAdmin",
      salary,
      address,
      govId,
    });

    console.log("Saving staff data...");
    const newAdmin = new Admin({
      name,
      staffId: staff._id,
      role: role || "admin",
      password: encryptPassword,
      registrationNumber: uId,
    });

    staff.teacherOrAdminId = newAdmin._id;
    department.staffMembers.push(staff._id);

    await department.save();
    console.log("Department updated with new staff member.");
    await newAdmin.save();
    console.log("New admin saved successfully.", newAdmin);
    await staff.save();
    console.log("Staff saved successfully.");

    newAdmin.password = "********";
    const sendRegistrationMail = await sendEmail(
      staff.email,
      "Email for Login Id and password",
      registrationEmail(newAdmin.name, newAdmin.registrationNumber)
    );
    if (!sendRegistrationMail) {
      console.log(
        "Warning: Admin added successfully, but Email not sent to Admin"
      );
      return res.status(400).json({
        error: "Admin added successfully, but Email not sent to Admin",
      });
    }

    console.log("Admin added successfully:", newAdmin);
    return res
      .status(201)
      .json({ message: "Admin added successfully", admin: newAdmin });
  } catch (error) {
    console.error("Error in addAdmin:", error);
    return res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password)
      return res.status(400).json({ error: "All fields are required." });
    const userData =
      loginId[0] === "A"
        ? await Admin.findOne({ registrationNumber: loginId }).select(
            "+password"
          )
        : loginId[0] === "T"
        ? await Teachers.findOne({ registrationNumber: loginId })
            .select("+password")
            .populate("staffId")
        : loginId[0] === "S"
        ? await Student.findOne({ registrationNumber: loginId }).select(
            "+password"
          )
        : await Parents.findOne({ registrationNumber: loginId })
            .select("+password")
            .populate("student");
    console.log("user", userData);
    if (!userData)
      return res.status(400).json({ error: "Invalid credentials" });
    const matchPassword = await bcrypt.compare(password, userData.password);
    if (!matchPassword)
      return res.status(400).json({ error: "Invalid credentials" });

    if (loginId[0] === "T") {
      console.log("Teacher is Logging In kbse bichara  try krr rha he");
      console.log("req.body", req.body);
      console.log("userData", userData);
    }
    // teacher
    if (loginId[0] === "T" && !userData.staffId.isActive) {
      console.log(userData);
      return res
        .status(401)
        .json({ error: "You are deleted by admin, contact to admin" });
    }

    // student
    if (loginId[0] === "S" && !userData.isActive) {
      return res
        .status(401)
        .json({ error: "You are remove. contact you teachers and admin" });
    }

    // parents
    if (loginId[0] === "P" && !userData.student.isActive) {
      return res
        .status(401)
        .json({
          error: "Your children is removed, contact teachers and admin",
        });
    }

    const token = await generateToken(userData._id, loginId);
    if (!token)
      return res
        .status(500)
        .json({ error: "error in generate token, try again" });
    const expirationTime = 24 * 60 * 60 * 1000;
    res.cookie("token", token, {
      maxAge: expirationTime,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res
      .status(200)
      .json({ message: "Login successfully!", token, userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

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
