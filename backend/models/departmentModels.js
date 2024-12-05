const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    staffMembers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }
    ]
});

const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department