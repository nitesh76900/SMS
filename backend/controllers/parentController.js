const Parent = require("../models/parentModels");

// Get all parents
const getAllParents = async (req, res) => {
    try {
        const parents = await Parent.find().populate("student", "name rollNumber class isActive");
        return res.status(200).json({
            message: "get all parents",
            data: parents
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

// Get a parent by ID
const getParentById = async (req, res) => {
    const { id } = req.params;
    try {
        const parent = await Parent.findById(id).populate("student", "name rollNumber class isActive");
        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }
        return res.status(200).json({
            message: "get parent data",
            data: parent
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

const getParentByStudentId = async (req, res) => {
    const { id } = req.params;
    try {
        const parent = await Parent.findOne({student: id}).populate("student", "name rollNumber class isActive");
        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }
        return res.status(200).json({
            message: "get parent data",
            data: parent
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

// Update a parent by ID
const updateParent = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedParent = await Parent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedParent) {
            return res.status(404).json({
                error: "Parent not found"
            });
        }
        return res.status(200).json({
            message: "Parent updated successfully",
            data: updatedParent
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getAllParents,
    getParentById,
    updateParent,
    getParentByStudentId
};
