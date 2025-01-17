const Staff = require("../models/staffModels");
const Department = require("../models/departmentModels");
const Admin = require("../models/adminModels");
const { registrationEmail } = require("../utils/html/html");
const generateUniqueId = require("../utils/generateId");
const hashPassword = require("../utils/password");
const sendEmail = require("../utils/sendMail");
const Connections = require("../models/connectionModels");
// Add a new staff member
exports.addStaff = async (req, res) => {
  console.log("Received request to add staff:", req.body);
  const departmentId = req.body.department;
  const department = await Department.findById(departmentId);
  if (!department) {
    console.log("Error: Department not found");
    return res.status(400).json({ error: "Department not found" });
  }
  const departmentName = department.name;
  try {
    const {
      name,
      phoneNo,
      joinDate,
      email,
      role = "admin",
      position,
      salary,
      govId,
      address,
    } = req.body;

    // Validation
    console.log("Validating staff data...");
    if (
      !name ||
      !phoneNo ||
      !joinDate ||
      !email ||
      !position ||
      !salary ||
      !govId ||
      !address ||
      !departmentName
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

    const department = await Department.findOne({ name: departmentName });
    if (!department) {
      console.log("Error: Department not found");
      return res.status(400).json({ error: "Department not found" });
    }

    const uId = `S${await generateUniqueId()}`;
    console.log("Generated unique ID for staff:", uId);

    const encryptPassword = await hashPassword(uId);
    if (!encryptPassword) {
      console.log("Error: hash password failed");
      return res.status(500).json({ error: "hash password failed" });
    }

    const staff = new Staff({
      name,
      email,
      phoneNo,
      joinDate,
      department: department._id,
      position,
      teacherOrAdmin:
        department.name === "Administration" ? "SuperAdmin" : department.name === "Teaching"? "Teacher": null,
      salary,
      address,
      govId,
    });

    console.log("Saving staff data...");

    if (departmentName === "Administration") {
      console.log("Creating admin for Administration department...");

      const newAdmin = new Admin({
        name,
        staffId: staff._id,
        role: role || "admin",
        password: encryptPassword,
        registrationNumber: uId,
      });

      staff.teacherOrAdminId = newAdmin._id;
      department.staffMembers.push(staff._id);

      await newAdmin.save();
      newAdmin.password = "****";
      const sendRegistrationMail = await sendEmail(
        staff.email,
        "Email for Login Id and password",
        registrationEmail(newAdmin.name, uId)
      );

      if (!sendRegistrationMail) {
        console.log("Warning: Staff added successfully, but Email not sent");
        return res.status(400).json({
          error: "Staff added successfully, but Email not sent",
        });
      }
      console.log("New admin saved successfully.");
    } else {
      department.staffMembers.push(staff._id);
    }

    await department.save();
    console.log("Department updated with new staff member.");

    await staff.save();
    console.log("Staff saved successfully.");

    console.log("Creating connection for new staff...");
    await Connections.create({
      name: staff.name,
      email: staff.email,
      profession: department.name === "Teaching"? "teacher": "other",
      otherProfession: "other",
      phoneNo: staff.phoneNo,
    });

    console.log("Staff added successfully:", staff);
    return res.status(201).json({ message: "Staff added successfully", staff });
  } catch (error) {
    console.error("Error in addStaff:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Update staff member details
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, joinDate, phoneNo, salary, address, govId } = req.body;

    const staff = await Staff.findById(id);
    if (!staff || !staff.isActive) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    // Update staff details
    staff.name = name ?? staff.name;
    staff.email = email ?? staff.email;
    staff.joinDate = joinDate ?? staff.joinDate;
    staff.phoneNo = phoneNo ?? staff.phoneNo;
    staff.salary = salary ?? staff.salary;
    staff.address = address ?? staff.address;
    staff.govId = govId ?? staff.govId;

    await staff.save();
    return res
      .status(200)
      .json({ message: "Staff updated successfully", data: staff });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get staff member details
exports.getStaff = async (req, res) => {
  try {
    console.log("Staff Id in Controller: ", req.params);
    const { id } = req.params;
    const staff = await Staff.findById(id).populate("department", "name");

    if (!staff || !staff.isActive) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    return res.status(200).json({ data: staff });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staffs = await Department.find().populate("staffMembers");
    return res.status(200).json({ message: "get all staff", data: staffs });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getStaffByDepartment = async (req, res) => {
  try {
    const staffs = await Department.findById(req.params.id).populate(
      "staffMembers"
    );
    return res.status(200).json({ message: "get all staff", data: staffs });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete staff member
exports.deleteStaff = async (req, res) => {
  try {
    console.log("Id in Satff Controller:", req.params);
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    const department = await Department.findById(staff.department);
    if (department) {
      if (department.name === "Administration") {
        return res
          .status(400)
          .json({ error: "Administration staff not delete directly" });
      }
      department.staffMembers = department.staffMembers.filter(
        (staffId) => staffId.toString() !== id
      );
      await department.save();
    }
    const deletedStaff = await Staff.findByIdAndUpdate(id, { isActive: false });
    if (deletedStaff) {
      return res.status(200).json({ message: "Staff deleted successfully" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Change staff role (only within the same "teacherOrAdmin" type)
exports.changeRole = async (req, res) => {
  try {
    // (id => staffId)
    const { id } = req.params;
    const { department, position } = req.body;

    // Find the staff member by ID
    const staff = await Staff.findById(id);
    if (!staff || !staff.isActive) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    const oldDept = await Department.findById(staff.department);

    // Restrict department change for "Teacher" or "SuperAdmin" positions
    if (
      oldDept.name === "Administration" ||
      oldDept.name === "Teaching" ||
      newDept === "Administration" ||
      newDept === "Teaching"
    ) {
      return res
        .status(400)
        .json({ error: "Administration and Teaching staff not edit directly" });
    }

    // Update department if necessary and allowed
    if (department && staff.department.toString() !== department) {
      const newDept = await Department.findById(department);
      if (!newDept) {
        return res.status(404).json({ error: "New department not found" });
      }

      // Remove staff from old department and add to new department
      if (oldDept) {
        oldDept.staffMembers = oldDept.staffMembers.filter(
          (staffId) => staffId.toString() !== id
        );
        await oldDept.save();
      }
      newDept.staffMembers.push(staff._id);
      await newDept.save();
      staff.department = department;
    }

    // Update position
    staff.position = position ?? staff.position;

    await staff.save();
    res.status(200).json({ message: "Role changed successfully", data: staff });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    console.log("Body in Staff Controller:", req.body);
    const { name } = req.body;
    const department = new Department({ name });
    await department.save();
    res
      .status(201)
      .json({ message: "Department created successfully", data: department });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
