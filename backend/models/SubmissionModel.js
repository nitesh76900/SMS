const mongoose = require("mongoose")

const SubmissionSchema = new mongoose.Schema({
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test ID is required']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required']
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    submissionTime: {
      type: Date
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      selectedOptions: [{
        type: mongoose.Schema.Types.ObjectId
      }],
      marks: {
        type: Number,
        default: 0
      }
    }],
    totalMarks: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT', 'EVALUATED'],
      default: 'IN_PROGRESS'
    }
  }, {
    timestamps: true
  });
  
  SubmissionSchema.index({ testId: 1, studentId: 1 });
  SubmissionSchema.index({ status: 1 });
  
  module.exports = mongoose.model('Submission', SubmissionSchema);