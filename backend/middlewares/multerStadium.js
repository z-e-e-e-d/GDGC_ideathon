// middlewares/multerStadium.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload directory
const uploadDir = path.join(__dirname, "../uploads");

// Storage configuration for stadium images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const finalPath = path.join(uploadDir, "stadiums");
    
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
    const filename = `stadium_${uniqueSuffix}_${safeName}${ext}`;
    console.log("Generated stadium image filename:", filename);
    
    cb(null, filename);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
  }
};

// Multer instance - allow multiple images (max 5)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 5 // Maximum 5 images
  }
});

module.exports = upload;