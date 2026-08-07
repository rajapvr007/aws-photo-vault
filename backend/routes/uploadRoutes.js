const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadImage,
} = require("../controllers/uploadController");

router.post("/", verifyToken, upload.single("image"), uploadImage);

module.exports = router;