const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }, // Name of the route (e.g., "Route A")
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  }, // Associated vehicle
  stops: [
    {
      stop: {
        type: String,
        required: true
      }, // Reference to a stop
      lng: {
        type: Number,
        required: true
      },
      lat: {
        type: Number,
        required: true
      },
      sequence: {
        type: Number,
        required: true
      }, // Order of the stop on the route
    },
  ],
  active: {
    type: Boolean,
    default: true
  }, // Is the route currently active?
}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;