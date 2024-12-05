const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: [true, 'Student ID is required.'] 
    },
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent', 
        required: [true, 'Parent ID is required.'] 
    },
    description: {
        type: String,
        required: [true, "Description is required."]
    },
    depositFee: { 
        type: Number, 
        required: [true, 'Deposit fee amount is required.'],
        min: [0, 'Deposit fee must be a positive amount.']
    },
    dateTime: { 
        type: Date, 
        default: Date.now 
    }
}, {timestamps: true});

const Receipt = mongoose.model('Receipt', receiptSchema);
module.exports = Receipt