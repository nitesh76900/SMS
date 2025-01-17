const crypto = require('crypto');
const Admin = require('../models/adminModels');
const Teachers = require('../models/teacherModels');
const Student = require('../models/studentModel');
const Parents = require('../models/parentModels');
const Driver = require('../models/DriverModel');

const generateUniqueId = async() => {
    const id = await crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
    if(await Admin.findOne({registrationNumber: `A${id}`})) return await generateUniqueId();
    if(await Teachers.findOne({registrationNumber: `T${id}`})) return await generateUniqueId();
    if(await Student.findOne({registrationNumber: `S${id}`})) return await generateUniqueId();
    if(await Parents.findOne({registrationNumber: `P${id}`})) return await generateUniqueId();
    if(await Driver.findOne({registrationNumber: `P${id}`})) return await generateUniqueId();
    return id;
}

module.exports = generateUniqueId
