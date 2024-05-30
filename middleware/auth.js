const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

module.exports = function (req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).send("Access denied. No token provided.");

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send("Invalid token.");
    }
};
