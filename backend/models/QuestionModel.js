const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: [true, 'Test ID is required']
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question text cannot exceed 1000 characters']
  },
  questionType: {
    type: String,
    enum: [
      'MULTIPLE_CHOICE', 
      'SINGLE_CHOICE', 
      'TRUE_FALSE', 
      'SHORT_ANSWER'  // Added to match frontend
    ],
    required: [true, 'Question type is required']
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      maxlength: [500, 'Option text cannot exceed 500 characters']
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [1, 'Marks must be at least 1']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  difficultyLevel: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'MEDIUM'
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  orderIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

QuestionSchema.index({ testId: 1 });

module.exports = mongoose.model('Question', QuestionSchema);