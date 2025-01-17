const mongoose = require('mongoose');

const vehicleHistorySchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  }, // Reference to the vehicle
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  }, // Reference to the vehicle
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  }, // Reference to the route
  date: {
    type: Date,
    required: true
  }, // Date of the tour
  stops: [
    {
      stop: {
        type: String,
        required: true
      }, // Name of the stop
      lng: {
        type: Number,
        required: true
      },
      lat: {
        type: Number,
        required: true
      },
      reached: {
        type: String,
        enum: ["Left", "Reached", "Next", "Pending"],
        default: "Pending"
      },
      arrivalTime: {
        type: Date
      }, // Time the vehicle arrived at the stop
    },
  ],
  completed: {
    type: Boolean,
    default: false
  }, // Indicates if the tour is completed
}, { timestamps: true });

const VehicleHistory = mongoose.model('VehicleHistory', vehicleHistorySchema);
module.exports = VehicleHistory;