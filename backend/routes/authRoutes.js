const express = require("express");

const router = express.Router();
const {
  verifyToken,
} = require("../middleware/authMiddleware");
const {
  signup,
  confirmSignup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/confirm", confirmSignup);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});
module.exports = router;