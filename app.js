const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const logger = require("./middleware/logger");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(logger);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const mongoURI = process.env.MONGO_URI;

mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
