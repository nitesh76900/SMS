const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    licenseNumber: { type: String, required: true, unique: true }, // Unique license number
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }, // Currently assigned vehicle
    experience: { type: Number, min: 0 }, // Years of experience
    dateOfBirth: { type: Date, required: true }, // Date of birth
    licenseExpiryDate: { type: Date, required: true }, // Expiry date of the driver's license
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        require: [true, 'Staff Id is required.']
    },
    registrationNumber: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        select: false,
    },
    img: {
        public_id: {type: String, required: true},
        url: {type: String, required: true},
    },
    role:{
        type: String,
        default: "driver"
    }
}, {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
});

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;
