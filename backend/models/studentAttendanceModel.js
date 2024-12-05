const mongoose = require("mongoose");

const studentAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["present", "absent", "pending"], // Updated to match frontend statuses
    default: "pending",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
studentAttendanceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const StudentAttendance = mongoose.model(
  "StudentAttendance",
  studentAttendanceSchema
);
module.exports = StudentAttendance;
