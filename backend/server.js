require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Photo Upload API is running 🚀",
  });
});
const s3Routes = require("./routes/s3TestRoutes");
const imageRoutes = require("./routes/imageRoutes");
const authRoutes = require("./routes/authRoutes");

    
app.use("/test-s3", s3Routes);
app.use("/images", imageRoutes);
app.use("/auth", authRoutes);

// Test database connection
app.get("/test-db", (req, res) => {
  db.query("SELECT NOW() AS currentTime", (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json({
      success: true,
      databaseTime: results[0].currentTime,
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});