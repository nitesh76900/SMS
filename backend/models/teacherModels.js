const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Teacher name is required.'],
        trim: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        require: [true, 'Staff Id is required.']
    },
    registrationNumber: {
        type: String,
        unique: true,
    },
    subject: {
        type: String,
        required: [true, 'Subject is required for the teacher.'],
        trim: true
    },
    assignedClass: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class"
        }
    ],
    leadClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        default: null
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        select: false,
    },
    role:{
        type: String,
        default: "teacher",
        immmutable: true 
    }
}, {timestamps: true});

const Teachers = mongoose.model('Teacher', teacherSchema);
module.exports = Teachers