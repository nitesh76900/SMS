const Class = require("../models/classModels")

exports.getAllClass = async(req, res)=>{
    try {
        const classes = await Class.find()
        return res.status(200).json({message: "Get all classes", data:classes})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Internal server error"})
    }
}
exports.getAllClassById = async(req, res)=>{
    try {
        const classes = await Class.findById(req.params.id).populate("students classTeacher subjects.teacher")
        if(!classes) return res.status(404).json({error: "Class not found"})
        return res.status(200).json({message: "Get classes", data:classes})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Internal server error"})
    }
}