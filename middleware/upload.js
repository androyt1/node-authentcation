const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile_pictures",
        allowedFormats: ["jpeg", "png", "jpg"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

const limits = {
    fileSize: 1024 * 1024,
};

const upload = multer({ storage, limits });

module.exports = upload;
