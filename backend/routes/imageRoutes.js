const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { getImageById } = require("../controllers/imageController");
const {
  getImages,
  deleteImage,
} = require("../controllers/imageController");

router.get("/", verifyToken, getImages);
router.get("/:id", verifyToken, getImageById);
router.delete("/:id", verifyToken, deleteImage);

module.exports = router;