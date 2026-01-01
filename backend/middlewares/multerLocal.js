// upload.js - Update to use consistent path
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
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `file_${unique}_${safeName}`);
  },
});

// ------------------ FILE FILTER ------------------
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extMatch = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeMatch = allowed.test(file.mimetype);
  if (extMatch && mimeMatch) {
    cb(null, true);
  } else {
    cb(new Error('Only image and document files are allowed'), false);
  }
};

// ------------------ LIMITS ------------------
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB limit
};

// **Export the multer instance**
const upload = multer({ 
  storage, 
  fileFilter,
  limits 
});

module.exports = upload;