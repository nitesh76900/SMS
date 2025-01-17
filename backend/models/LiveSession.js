const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  sessionLink: {
    type: String,
    required: [true, 'Session link is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  startFrom: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
}, {timestamps: true});

// Middleware to prevent overlapping sessions for the same teacher
liveSessionSchema.pre('save', async function(next) {
  if (this.isModified('startFrom') || this.isModified('duration')) {
    const sessionEnd = new Date(this.startFrom.getTime() + this.duration * 60000);
    
    const overlappingSession = await this.constructor.findOne({
      teacher: this.teacher,
      _id: { $ne: this._id },
      startFrom: { $lt: sessionEnd },
      $expr: {
        $lt: [
          { $subtract: [{ $add: ['$startFrom', { $multiply: ['$duration', 60000] }] }, this.startFrom] },
          this.duration * 60000
        ]
      }
    });

    if (overlappingSession) {
      next(new Error('This time slot overlaps with another session'));
    }
  }
  next();
});

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
module.exports = LiveSession;