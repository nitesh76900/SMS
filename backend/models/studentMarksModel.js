const mongoose = require("mongoose");

const studentMarksSchema = new mongoose.Schema({
	marks: [
		{
			subject: {
				type: String,
				required: [true, "Subject is required"],
				trim: true,
			},
			mark: {
				type: Number,
				required: [true, "Mark is required"],
				min: [0, "Mark cannot be negative"],
			},
		},
	],
	studentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Student",
		required: true,
	},
	totalMarks: {
		type: Number,
		default: 0,
	},
	result: {
		type: Boolean,
		default: false,
	},
}, {timestamps: true});

// Middleware to calculate total marks and set result status before saving
studentMarksSchema.pre("save", function (next) {
	// Calculate total marks
	this.totalMarks = (this.marks.reduce((sum, item) => sum + item.mark, 0));

	// Set the result based on a passing criteria, e.g., total marks > 40
	this.result = this.totalMarks/this.marks.length > 40; // Adjust the passing criteria as needed
	next();
});

const StudentMarks = mongoose.model("StudentMarks", studentMarksSchema);
module.exports = StudentMarks