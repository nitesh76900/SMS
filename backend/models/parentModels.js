const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    fatherName: {
        type: String,
        required: [true, 'Father name is required.'],
        trim: true
    },
    motherName:{
        type: String,
        required: [true, 'Mather name is required.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required for the parent.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address.']
    },
    phoneNo: {
        type: String,
        required: [true, 'Phone number is required for the parent.'],
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits.'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required for the parent.'],
        trim: true
    },
    registrationNumber: {
        type: String,
        unique: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required for the parent.']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        select: false,
    },
    role:{
        type: String,
        default: "parent",
        immmutable: true 
    }
}, {timestamps: true});

const Parents = mongoose.model('Parent', parentSchema);
module.exports = Parents