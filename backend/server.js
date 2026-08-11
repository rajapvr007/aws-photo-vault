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

const imageRoutes = require("./routes/imageRoutes");
const authRoutes = require("./routes/authRoutes");

    

app.use("/images", imageRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});