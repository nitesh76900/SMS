const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true,
        trim: true
    },
    registration: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        default: "active",
        enum: ["active", "inactive", "maintenance"]
    },
    driverAssigned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
    }],
    img: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    ownership: {
        type: String,
        required: true,
        enum: ["owned", "leased", "rented"]
    },
    yearOfManufacture: {
        type: Number,
        required: true,
        validate: {
            validator: function(year) {
                return year >= 1900 && year <= new Date().getFullYear();
            },
            message: props => `${props.value} is not a valid year!`
        }
    },
    pollutionValidUntil: {
        type: Date,
        required: true
    },
    lastServiceDate: {
        type: Date,
        required: true
    },
    totalKm: {
        type: Number,
        default: 0,
        min: 0
    },
    insuranceExpiry: {
        type: Date,
        required: true
    },
    maintenanceCost: {
        type: Number,
        default: 0,
        min: 0
    },
    fuelCharge: {
        type: Number,
        default: 0,
        min: 0
    },
    chassisNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    engineNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    color: {
        type: String,
        default: "Yellow",
        trim: true
    },
    routeAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    }
}, {timestamps: true});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;