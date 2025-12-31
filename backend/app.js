const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
// const helmet = require("helmet"); // COMMENTED OUT FOR TESTING
const sanitisze = require("../backend/middlewares/sanitizeBody");
dotenv.config();


const authRoutes = require("./routes/authRoute");
const stadiumRoutes = require("./routes/stadiumRoute");
const adminRoutes = require("./routes/adminRoute");
const teamsRoutes = require ("./routes/teamRoute");
const reservationRoutes = require("./routes/reservationRoutes");
// const fileRoutes = require("./routes/fileRoute");

const app = express();

app.use(express.json());
app.use(sanitisze);
// app.use(helmet()); // COMMENTED OUT FOR TESTING

// Allow only specific origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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
});