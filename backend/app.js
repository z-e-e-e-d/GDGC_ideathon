const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
// const helmet = require("helmet"); // COMMENTED OUT FOR TESTING
const sanitisze = require("../backend/middlewares/sanitizeBody");
dotenv.config();

const authRoutes = require("./routes/authRoute");
const stadiumRoutes = require("./routes/stadiumRoute");
const adminRoutes = require("./routes/adminRoute");
const teamsRoutes = require("./routes/teamRoute");
const reservationRoutes = require("./routes/reservationRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
// const fileRoutes = require("./routes/fileRoute");

const app = express();

app.use(express.json());
app.use(sanitisze);
// app.use(helmet()); // COMMENTED OUT FOR TESTING

// Allow only specific origin
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads directory:", uploadDir);
}

// ------------------ STATIC FILE SERVING ------------------
// Serve uploaded files as static content
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Optional: Create a specific route for file access with better security
app.get("/api/uploads/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params;
  
  // Security: Validate folder and filename
  const allowedFolders = ["docs", "images"];
  if (!allowedFolders.includes(folder)) {
    return res.status(400).json({ error: "Invalid folder" });
  }
  
  if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).json({ error: "Invalid filename" });
  }
  
  const filePath = path.join(__dirname, "uploads", folder, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  
  // Send the file
  res.sendFile(filePath);
});

// Optional: Route to get file info (for security/auditing)
app.get("/api/files/info/:filename", (req, res) => {
  const { filename } = req.params;
  
  // Search for file in all upload subdirectories
  const searchFiles = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        const found = searchFiles(fullPath);
        if (found) return found;
      } else if (file.name === filename) {
        return {
          path: fullPath,
          name: file.name,
          size: fs.statSync(fullPath).size,
          modified: fs.statSync(fullPath).mtime,
        };
      }
    }
    return null;
  };
  
  const fileInfo = searchFiles(uploadDir);
  if (!fileInfo) {
    return res.status(404).json({ error: "File not found" });
  }
  
  // Don't expose full server path to client
  const relativePath = path.relative(__dirname, fileInfo.path);
  res.json({
    filename: fileInfo.name,
    size: fileInfo.size,
    modified: fileInfo.modified,
    url: `/uploads/${path.relative(uploadDir, fileInfo.path).replace(/\\/g, '/')}`,
  });
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/stadium", stadiumRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/reservation", reservationRoutes);
app.use("/api/owners", ownerRoutes);
// app.use("/api/files", fileRoutes);

app.get("/", (req, res) => {
  res.send(" Website API");
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Server Error",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files accessible at: http://localhost:${PORT}/uploads/`);
  console.log(`Upload directory: ${uploadDir}`);
});