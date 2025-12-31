const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ------------------ CONFIG ------------------
const uploadDir = path.join(__dirname, "../uploads");

// Ensure root uploads folder exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------ STORAGE ------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = "images"; // default

        // determine if file is document or image
        const isDoc = /pdf|doc|docx/.test(file.mimetype);
        if (isDoc) folder = "docs";

        const finalPath = path.join(uploadDir, folder);

        fs.mkdirSync(finalPath, { recursive: true });

        cb(null, finalPath);
    },

    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "_" + unique + ext);
    }
});

// ------------------ FILE FILTER ------------------
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extMatch = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeMatch = allowed.test(file.mimetype);

    if (extMatch && mimeMatch) cb(null, true);
    else cb(new Error("Only images or documents allowed"));
};

module.exports = multer({ storage, fileFilter });
