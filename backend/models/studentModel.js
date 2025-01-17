const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    admissionDate: {
      type: Date,
      default: Date.now(),
      required: [true, "Year is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    batch: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of Birth is required"],
    },
    phoneNo: {
      type: String,
      required: [true, "Student mobile number is required"],
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    role: {
      type: String,
      default: "student",
      immmutable: true,
    },
    address: {
      type: String,
      required: [true, "student address is required"],
    },
    feeStructure: {
      addmissionFee: {
        type: Number,
        required: [true, "Student fees is required"],
        min: [0, "Addmission fee must be a positive amount."],
      },
      tuitionFee: {
        type: Number,
        required: [true, "Student fees is required"],
        min: [0, "Tuition fee must be a positive amount."],
      },
      computerFee: {
        type: Number,
        required: [true, "Student fees is required"],
        min: [0, "Computer fee must be a positive amount."],
      },
      examFee: {
        type: Number,
        required: [true, "Student fees is required"],
        min: [0, "Examination fee must be a positive amount."],
      },
      fine: {
        type: Number,
        required: [true, "Student fees is required"],
        min: [0, "Total fee must be a positive amount."],
      },
      miscellaneous: {
        type: Number,
        required: [true, "Student fees is required"],
        min: [0, "Miscellaneous fee must be a positive amount."],
      },
    },
    totalFee: {
      type: Number,
      required: [true, "Student fees is required"],
      min: [0, "Fine must be a positive amount."],
    },
    feesPaid: {
      type: Number,
      default: 0,
      min: [0, "Fees paid must be a positive amount."],
    },
    feesDue: {
      type: Number,
      min: [0, "Fees due must be a positive amount."],
      default: function () {
        return this.totalFee - this.feesPaid;
      },
    },
    remindByWhatsapp: {
      type: Number,
      default: 0,
      min: [0, "Reminder count cannot be negative."],
    },
    remindByEmail: {
      type: Number,
      default: 0,
      min: [0, "Reminder count cannot be negative."],
    },
    lastPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, validateBeforeSave: true }
);

studentSchema.pre("save", function (next) {
  // Ensure feesPaid + feesDue equals totalFee
  if (this.feesPaid > this.totalFee) {
    console.log("this.feesPaid", this.feesPaid);
    console.log("this.totalFee", this.totalFee);

    return next(new Error("Fees paid cannot exceed total fee."));
  }

  // Calculate feesDue based on totalFee and feesPaid
  this.feesDue = this.totalFee - this.feesPaid;

  if (this.feesDue < 0) {
    return next(new Error("Calculated fees due cannot be less than zero."));
  }

  next();
});

studentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.totalFee !== undefined || update.feesPaid !== undefined) {
    const feesPaid = update.feesPaid || this.get("feesPaid");
    const totalFee = update.totalFee || this.get("totalFee");
    const feesDue = totalFee - feesPaid;

    console.log(this.get());

    if (feesDue < 0) {
      return next(new Error("Calculated fees due cannot be less than zero."));
    }

    update.feesDue = feesDue;
    this.setUpdate(update);
  }
  next();
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
