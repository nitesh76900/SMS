const checkAdmin = (req, res, next) => {
  try {
    const userData = req.user;
    if(userData.role !== "admin" && userData.role !== "superAdmin"){
        return res.status(401).json({error: "Admin access required"})
    }
    next();
  } catch (err) {
    console.log('err', err)
    return res.status(500).send({
      error: err.message
    });
  }
};

module.exports = checkAdmin ;
