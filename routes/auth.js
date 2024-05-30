const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const secretKey = process.env.SECRET_KEY;
const loginLimiter = require("../middleware/rateLimit");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

function generateTokens(user) {
    const accessToken = jwt.sign({ _id: user._id, username: user.username }, secretKey, {
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ _id: user._id, username: user.username }, secretKey, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
}

// http://localhost:5000/api/auth/register
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.status(400).send("All fields are required.");
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) return res.status(400).send("Invalid email format.");

    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) return res.status(400).send("Username or Email already exists.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.send("User registered successfully.");
});

// http://localhost:5000/api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password)
        return res.status(400).send("Username/Email and password are required.");

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) return res.status(400).send("Invalid credentials.");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send("Invalid credentials.");

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.send({ accessToken, refreshToken });
});

router.post("/token", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send("Refresh token is required.");

    try {
        const decoded = jwt.verify(refreshToken, secretKey);
        const user = await User.findById(decoded._id);
        if (!user || user.refreshToken !== refreshToken)
            return res.status(400).send("Invalid refresh token.");

        const { accessToken, newRefreshToken } = generateTokens(user);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.send({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        res.status(400).send("Invalid refresh token.");
    }
});

router.post("/profile-picture", auth, upload.single("profilePicture"), async (req, res) => {
    try {
        const user = req.user;
        user.profilePicture = req.file.path;
        await user.save();
        res.send("Profile picture uploaded successfully.");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
