const mongoose = require("mongoose");

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["present", "absent", "pending"],  // Updated to match frontend statuses
    default: "pending",
    required: true,
  },
  entryTime: {
    type: String,  // Store as string to match frontend format
    default: "",
  },
  // remarks: {
  //   type: String,
  //   default: "",
  // },
  // department: {
  //   type: String,
  //   required: true,
  // },
  // designation: {
  //   type: String,
  //   required: true,
  // }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
teacherAttendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

const TeacherAttendance = mongoose.model("TeacherAttendance", teacherAttendanceSchema);
module.exports = TeacherAttendance;