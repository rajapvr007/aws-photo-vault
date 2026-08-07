const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
  getImages,
  deleteImage,
} = require("../controllers/imageController");

router.get("/", verifyToken, getImages);
router.delete("/:id", verifyToken, deleteImage);

module.exports = router;