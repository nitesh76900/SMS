
// staffAttendanceModels.js
const mongoose = require("mongoose");

const staffAttendanceSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'pending'],
        default: 'pending'
    },
    entryTime: {
        type: String,
        default: ''
    },
    remarks: {
        type: String,
        default: ''
    }
});

const StaffAttendance = mongoose.model('StaffAttendance', staffAttendanceSchema);
module.exports = StaffAttendance;