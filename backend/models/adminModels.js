const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required for SuperAdmin.'],
        trim: true
    },
    registrationNumber: {
        type: String,
        unique: true,
        required: [true, 'Registration number is required.']
        
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        require: [true, 'Staff Id is required.']
    },
    role: {
        type: String,
        enum: ["admin", "superAdmin"],
        default: "admin",
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        select: false,
    }
}, {timestamps: true});

const Admin = mongoose.model('SuperAdmin', superAdminSchema);
module.exports = Admin