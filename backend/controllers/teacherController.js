const Staff = require("../models/staffModels");
const Teacher = require("../models/teacherModels");

// Get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("leadClass");
    return res.status(200).json({
      message: "get all teacher",
      data: teachers,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get a teacher by ID
const getTeacherById = async (req, res) => {
  const { id } = req.params;
  console.log("req.params", id);
  try {
    const teacher = await Teacher.findById(id)
      .populate({
        path: "assignedClass leadClass",
        select: "name section", // Only select name and section
      })
      .populate({
        path: "staffId",
        select: "", // No specific select, meaning all fields from staffId will be populated
      });

    if (!teacher) {
      return res.status(404).json({
        error: "Teacher not found",
      });
    }
    res.status(200).json({
      message: "get teacher",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve teacher",
    });
  }
};

// Update a teacher by ID
const updateTeacher = async (req, res) => {
  console.log("req.body in update teacher", req.body);
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    const updatedStaff = await Staff.findById({ _id: updateData.staffId });
    updatedStaff.salary = updateData.salary;
    await updatedStaff.save();
    if (!updatedTeacher) {
      return res.status(404).json({
        error: "Teacher not found",
      });
    }
    res.status(200).json({
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error: "Failed to update teacher",
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  updateTeacher,
};
