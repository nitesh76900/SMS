const Department = require("./models/departmentModels");

const connectDB = require("./db/db");
// require("dotenv").config();
require("dotenv").config({ path: "../.env" });

const createDepartment = async () => {
  try {
    console.log("process.env.DB_URL", process.env.DB_URL);
    const url = process.env.DB_URL;
    await connectDB(url);
    console.log("Database connected!");
    const depArr = [
      "Teaching",
      "Administration",
      "Finance",
      "Support and Maintenance",
      "Library",
      "Transtport",
      "IT",
      "Sports and Extracurricular",
    ];
    depArr.map(async (e) => {
      await Department.create({ name: e });
      console.log(`${e} department is created.`);
    });
  } catch (error) {
    consol.log(error);
  }
};

createDepartment();
