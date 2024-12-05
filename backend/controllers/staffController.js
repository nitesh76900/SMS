const Staff = require("../models/staffModels");
const Department = require("../models/departmentModels");

// Add a new staff member
exports.addStaff = async (req, res) => {
  console.log("Starting addStaff function");

  try {
    console.log("Request body received:", req.body);

    const {
      name,
      email,
      joinDate,
      phoneNo,
      department,
      position,
      salary,
      address,
      govId,
    } = req.body;

    // Log extracted fields
    console.log("Extracted fields:", {
      name,
      email,
      joinDate,
      phoneNo,
      department,
      position,
      salary,
      address,
      govId,
    });

    // Ensure department exists
    console.log("Checking if department exists...", department);
    const dept = await Department.findById(department);
    if (!dept) {
      console.error("Department not found");
      return res.status(404).json({ error: "Department not found" });
    }

    console.log("Department found:", dept);

    if (dept.name === "Administration" || dept.name === "Teaching") {
      console.error(
        "Attempt to directly create staff for Administration or Teaching department"
      );
      return res.status(400).json({
        error: "Administration and Teaching staff not create directly",
      });
    }

    // Create a new staff member
    console.log("Creating a new staff member...");
    const staff = new Staff({
      name,
      email,
      joinDate,
      phoneNo,
      department,
      position,
      salary,
      address,
      govId,
    });

    // Save staff
    console.log("Saving staff to database...");
    await staff.save();
    console.log("Staff saved successfully:", staff);

    // Add to department
    console.log("Adding staff to department...");
    dept.staffMembers.push(staff._id);
    await dept.save();
    console.log("Staff added to department successfully");

    // Respond to client
    console.log("Responding with success message...");
    return res
      .status(201)
      .json({ message: "Staff added successfully", data: staff });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return res.status(400).json({ error: error.message });
  }
};

// Update staff member details
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, joinDate, phoneNo, salary, address, govId } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
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

    if (!staff) {
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
      department.staffMembers = department.staffMembers.filter(
        (staffId) => staffId.toString() !== id
      );
      await department.save();
    }
    const deletedStaff = await Staff.findByIdAndDelete(id);
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
    if (!staff) {
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
