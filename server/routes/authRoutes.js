const express = require("express");
const {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
