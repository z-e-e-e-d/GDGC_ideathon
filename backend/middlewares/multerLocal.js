// middlewares/multerLocal.js - CORRECTED VERSION
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload directory
const uploadDir = path.join(__dirname, "../uploads");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype === "application/pdf" ? "docs" : "images";
    const finalPath = path.join(uploadDir, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }
    
    cb(null, finalPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    
    // Clean the original filename
    const originalName = path.basename(file.originalname, ext);
    const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    
    // Store JUST the filename (not path)
    const filename = `owner_doc_${uniqueSuffix}_${safeName}${ext}`;
    console.log("Generated filename:", filename); // Debug log
    
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;