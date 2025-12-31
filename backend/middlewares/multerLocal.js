const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ------------------ CONFIG ------------------
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ------------------ STORAGE ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = /pdf|doc|docx/.test(file.mimetype) ? "docs" : "images";
    const finalPath = path.join(uploadDir, folder);
    fs.mkdirSync(finalPath, { recursive: true });
    cb(null, finalPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + unique + ext);
  },
});

// ------------------ FILE FILTER ------------------
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extMatch = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeMatch = allowed.test(file.mimetype);
  cb(null, extMatch && mimeMatch);
};

// **Export the multer instance**
const upload = multer({ storage, fileFilter });
module.exports = upload;  // ✅ make sure you export the multer instance
