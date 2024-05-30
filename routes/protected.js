const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/protected", auth, (req, res) => {
    res.send("This is a protected route.");
});

module.exports = router;
