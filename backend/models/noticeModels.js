const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required for the notice.'],
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'Date is required for the notice.']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required for the notice.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required for the notice.'],
        trim: true
    },
    for: {
        type: String,
        required: [true, 'Target audience is required for the notice.'],
        enum: {
            values: ['students', 'teachers', 'parents', 'all'],
            message: 'Audience must be one of the following: students, teachers, parents, or all.'
        },
        default: "all"
    },
    img: {
        url: {
          type: String,
          validate: {
            validator: function (v) {
              // Allow null or an empty string
              if (!v) return true;
              // Validate URL format if value is provided
              return /^(ftp|http|https):\/\/[^ "]+$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`,
          },
          required: false, // Make the URL field optional
          default: null,    // Default value for URL is null
        },
        public_id: {
          type: String,
          required: false, // Make public_id field optional
          default: null,    // Default value for public_id is null
        },
      }
      
      
}, {timestamps: true});

const Notice = mongoose.model('Notice', noticeSchema);
module.exports = Notice