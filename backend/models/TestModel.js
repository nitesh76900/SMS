// models/TestModel.js
const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true,
    maxlength: [100, 'Test title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Test duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1']
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions is required'],
    min: [1, 'Must have at least one question']
  },
  startTime: {
    type: Date,
    required: [true, 'Test start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'Test end time is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Test creator is required']
  },
  subject: {
    type: String, // Changed to match frontend
    required: [false, 'Subject is required']
  },
  class: {
    type: String, // Changed to match frontend
    required: [false, 'Class is required']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  passingPercentage: {
    type: Number,
    required: [true, 'Passing percentage is required'],
    min: [0, 'Passing percentage cannot be negative'],
    max: [100, 'Passing percentage cannot exceed 100'],
    default: 40
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, {
  timestamps: true
});

// Add indexes for common queries
TestSchema.index({ createdBy: 1, subject: 1, class: 1 });
TestSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Test', TestSchema);