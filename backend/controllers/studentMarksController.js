const StudentMarks = require("../models/studentMarksModel");
const Student = require("../models/studentModel");

// Add marks for a student
exports.addStudentMarks = async (req, res) => {
  try {

    const {studentId} = req.body
    if(await StudentMarks.findOne({studentId})){
      return res.status(400).json({message: "already created."})
    }

    console.log("req.body:", req.body);
    const newMarks = new StudentMarks(req.body);
    await newMarks.save();
    res
      .status(201)
      .json({ message: "Marks added successfully", data: newMarks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding marks", error: error.message });
  }
};

// Get all students' marks
exports.getAllStudentMarks = async (req, res) => {
  try {
    const marks = await StudentMarks.find().populate({
      path: "studentId", // This is the field in the StudentMarks model
      select: "name registrationNumber dob class isActive", // Fields from the student document
      populate: {
        path: "class", // Populating the class field, assuming `class` is a reference to another collection
        select: "name section", // You can adjust the fields as needed from the class collection
      },
    });

    res.status(200).json(marks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching marks", error: error.message });
  }
};

// Get marks for a student by registration number and dob
exports.getStudentMarksByRegistrationAndDob = async (req, res) => {
  const { registrationNumber, dob } = req.params;

  try {
    console.log("registrationNumber", registrationNumber);
    console.log("dob", dob);
    // Find the student with the given registration number and DOB
    const student = await Student.findOne({ registrationNumber });
    console.log("student", student);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find marks using the student's ID
    const studentMarks = await StudentMarks.findOne({ studentId: student._id });
    if (!studentMarks) {
      return res
        .status(404)
        .json({ message: "Marks not found for this student" });
    }
    res.status(200).json(studentMarks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching marks", error: error.message });
  }
};

// Update marks for a specific student by ID
exports.updateStudentMarks = async (req, res) => {
  try {
    console.log("req.params", req.params);
    console.log("req.body", req.body);
    const studentData=await StudentMarks.findOne({_id: req.params.studentId}).populate("studentId")
    console.log('studentData', studentData);
    const updatedMarks = await StudentMarks.findOneAndUpdate(
      { _id: req.params.studentId },
      { marks: req.body.marks },
      { new: true, runValidators: true }
    );

    if (!updatedMarks) {
      return res
        .status(404)
        .json({ message: "Marks not found for this student" });
    }

    // Recalculate totalMarks and result before saving
    await updatedMarks.save();

    res
      .status(200)
      .json({ message: "Marks updated successfully", data: updatedMarks });
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Error updating marks", error: error.message });
  }
};
