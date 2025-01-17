const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Class name is required.'],
        trim: true
    },
    section: {
        type: String,
        required: [true, 'Section is required for the class.'],
        trim: true
    },
    subjects: [
        {
            subjectName: {
                type: String,
                required: [true, 'Subject ID is required in the subject array.'],
                trim: true
            },
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Teacher',
                default: null,
            }
        }
    ],
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student ID is required in the students array.']
        }
    ],
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        default: null
    }
}, {timestamps: true});

const Class = mongoose.model('Class', classSchema);
module.exports = Class