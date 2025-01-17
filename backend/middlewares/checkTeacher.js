const checkTeacher = async (req, res, next) => {
    try {
        const userData = req.user;
        if (userData.role !== "teacher" && userData.role !== "admin" && userData.role !== "superAdmin") {
            return res.status(401).json({ error: "access denied!" })
        }
        next();
    } catch (err) {
        return res.status(401).send({
            error: "access denied!"
        });
    }
};

module.exports = checkTeacher;
