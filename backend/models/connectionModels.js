const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required for the connection."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required for the connection."],
      match: [/.+\@.+\..+/, "Please enter a valid email address."],
      trim: true,
      lowercase: true,
    },
    profession: {
      type: String,
      required: [true, "Profession is required."],
      enum: {
        values: ["student", "teacher", "parents", "admin", "other"],
        message:
          "Profession must be either student, teacher, parents, or other.",
      },
    },
    otherProfession: {
      type: String,
      trim: true,
      required: function () {
        return this.profession === "other";
      },
      message: "Other profession is required when profession is set to other.",
    },
    phoneNo: {
      type: String,
      trim: true,
      required: [true, "Phone number is required for the connection."],
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits."],
    },
  },
  { timestamps: true }
);

const Connections = mongoose.model("Connection", connectionSchema);
module.exports = Connections;
