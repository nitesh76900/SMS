const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModels");
const Teachers = require("../models/teacherModels");
const studentModel = require("../models/studentModel");
const Parents = require("../models/parentModels");

const jwtToken = async (req, res, next) => {
  console.log("jwtCalled");
  let token = req.cookies.token;
  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded) {
      return res.status(401).send({
        error: "Not authorized, token failed",
      });
    }
    const rsNo = decoded.rsNo;
    const userData =
      rsNo[0] === "A"
        ? await Admin.findById(decoded.id)
        : rsNo[0] === "T"
        ? await Teachers.findById(decoded.id)
        : rsNo[0] === "S"
        ? await studentModel.findById(decoded.id)
        : await Parents.findById(decoded.id);

    console.log(userData);
    if (!userData) {
      return res.status(404).send({
        error: "User not found",
      });
    }
    req.user = userData;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({
      error: "Not authorized, token failed",
    });
  }
};

module.exports = jwtToken;
