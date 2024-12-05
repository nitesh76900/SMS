const Department = require("./models/departmentModels")
const connectDB = require("./db/db")
require("dotenv").config();

const createDepartment = async() =>{
    try {
        const url = process.env.DB_URL
        await connectDB(url)
        console.log("Database connected!")
        const depArr = ["Teaching", "Administration", "Finance", "Support and Maintenance", "Library", "IT", "Sports and Extracurricular"]
        depArr.map(async(e)=>{
            await Department.create({name: e})
            console.log(`${e} department is created.`)
        })
    } catch (error) {
        consol.log(error)
    }
}

createDepartment();