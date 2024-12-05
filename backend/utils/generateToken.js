const jwt = require("jsonwebtoken")
// Generate JWT token

const generateToken = (id, rsNo) => {
    console.log("id",id);
    const token = jwt.sign({ id, rsNo }, process.env.JWT_KEY, { expiresIn: '1d' });
    console.log("token " + token)
    return token;
    // return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  };

module.exports = generateToken