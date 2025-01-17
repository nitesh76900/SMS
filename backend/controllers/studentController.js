const Class = require("../models/classModels");
const Parents = require("../models/parentModels");
const Receipt = require("../models/receiptModel");
const Student = require("../models/studentModel");
const { feePaymentMail, feesReminder } = require("../utils/html/html");
const sendEmail = require("../utils/sendMail");

// Get all students
exports.getAllStudents = async (req, res) => {
  try {

    const students = await Student.find({});
    return res.status(200).json({ message: "get all student", data: students });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Id in controller:", id);
    const student = await Student.findById(id).populate("class");
    if (!student || !student.isActive) {
      return res.status(404).json({ error: "Student not found" });
    }
    return res
      .status(200)
      .json({ message: `get ${student.name} data`, data: student });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getStudentByClass = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id ", id);
    const classData = await Class.findById(id);
    const student = await Student.find({ class: classData._id});
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    return res.status(200).json({
      message: `get ${student.name} data`,
      data: { class: classData, student },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update student by ID
exports.updateStudentById = async (req, res) => {
  try {
    console.log("Student update Data:", req.body);
    const { id } = req.params;
    const updatedStudent = await Student.findOneAndUpdate({_id: id, isActive: true}, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    return res
      .status(200)
      .json({ message: "Student data updated", data: updatedStudent });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

// Delete student by ID
exports.deleteStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addFeePayment = async (req, res) => {
  try {
    const { studentId, depositFee, description } = req.body;

    // Validate required fields
    if (!studentId || depositFee === null || !description) {
      return res
        .status(400)
        .json({ error: "studentId, depositFee and description are required." });
    }

    if (depositFee <= 0) {
      return res
        .status(400)
        .json({ error: "Deposit fee must be a positive amount." });
    }

    // Find student's fee record
    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({ error: "Student record not found." });
    }

    if (student.totalFee === 0)
      return res.status(400).json({ error: "Student fee not set" });

    const parent = await Parents.findOne({ student: student._id });
    console.log(parent);
    if (!parent)
      return res.status(404).json({ error: "Parent record not found." });

    // Check if adding depositFee would exceed totalFee
    const updatedFeesPaid = student.feesPaid + depositFee;
    if (updatedFeesPaid > student.totalFee) {
      return res
        .status(400)
        .json({ error: "Paid fee cannot exceed the total fee." });
    }

    // Update feesPaid and calculate feesDue
    student.feesPaid = updatedFeesPaid;

    // Create a new receipt for this payment
    const receipt = await Receipt.create({
      studentId: student._id,
      parentId: parent._id,
      description,
      depositFee,
    });

    student.lastPayment = receipt;

    // Save updated studentFee document
    await student.save();
    // parentName, studentName, studentRegistrationNumber, parentRegistrationNumber, depositFee, paymentDate, totalFee, feesPaid, feesDue
    const emailForFeeRecipt = sendEmail(
      parent.email,
      "Fees Recipt",
      feePaymentMail({
        parentName: parent.fatherName,
        studentName: student.name,
        studentRegistrationNumber: student.registrationNumber,
        parentRegistrationNumber: parent.registrationNumber,
        depositFee: receipt.depositFee,
        paymentDate: receipt.dateTime,
        totalFee: student.totalFee,
        feesPaid: student.feesPaid,
        feesDue: student.feesDue,
        description: receipt.description,
      })
    );
    if (!emailForFeeRecipt)
      return res.status(200).json({
        message: "Fee payment added successfully. But Receipt Email not send",
      });

    return res.status(200).json({
      message: "Fee payment added successfully.",
      data: {
        student,
        receipt,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the payment." });
  }
};

exports.getAllReceipt = async (req, res) => {
  try {
    const receiptData = await Receipt.find();
    return res
      .status(200)
      .json({ message: "get all receipt", data: receiptData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while get all receipt." });
  }
};

exports.getAllReceiptById = async (req, res) => {
  try {
    const receiptData = await Receipt.findById(req.params.id).populate(
      "studentId parentId"
    );
    return res
      .status(200)
      .json({ message: "get all receipt", data: receiptData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while get single receipt." });
  }
};

exports.getAllReceiptByStudent = async (req, res) => {
  try {
    const receiptData = await Receipt.find({ studentId: req.params.id });
    return res
      .status(200)
      .json({ message: "get all receipt", data: receiptData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while get All Receipt By Student." });
  }
};

exports.feeReminderByEmail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) return res.status(404).json({ error: "Student not found" });
    console.log(student);
    const parent = await Parents.findOne({ student: student._id });
    if (!parent) return res.status(404).json({ error: "Parent not found" });
    if (student.feesDue === 0) {
      return res.status(400).json({ error: "No Due fees left" });
    }

    //const send = await sendEmail(email, sub, msg) ====> send mail
    // if(!send) return res.status(500).json({error: "email not send, try again"});

    const emailReminder = await sendEmail(
      parent.email,
      "Fees Reminder",
      feesReminder({
        parentName: parent.fatherName,
        studentName: student.name,
        studentRegistrationNumber: student.registrationNumber,
        parentRegistrationNumber: parent.registrationNumber,
        totalFee: student.totalFee,
        feesPaid: student.feesPaid,
        feesDue: student.feesDue,
      })
    );

    if (!emailReminder) {
      return res
        .status(500)
        .json({ Error: "Email not send please try again." });
    }

    student.remindByEmail = ++student.remindByEmail;
    await student.save();
    return res.status(200).json({ message: "Email sended successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while get All Receipt By Student." });
  }
};
