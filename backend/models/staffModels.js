const mongoose = require("mongoose")

const StaffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'Email is required for the teacher.'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address.']
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required for the teacher.']
    },
    phoneNo: {
        type: String,
        required: [true, 'Phone number is required for the teacher.'],
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits.'],
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    position: {
        type: String,
        required: false,
        default:null
    },
    teacherOrAdmin:{
        type: String,
        enum: ["Teacher", "SuperAdmin", null],
        default: null
    },
    teacherOrAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'teacherOrAdmin', // Refers to either Teacher or Admin schema based on position
        default: null
    },
    salary: {
        type: String,
        required: [true, 'Salary is required for the teacher.'],
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    govId: {
        type: String,
        required: true,
        unique: true
    },
    isActive:{
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Staff = mongoose.model('Staff', StaffSchema);
module.exports = Staff