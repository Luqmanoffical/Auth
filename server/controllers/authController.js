const User = require("../models/User");
const crypto = require("crypto");

const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
// Helper function for token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
// Register user
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    const otp = user.generateOTP();
    await user.save();
    const message = `Your verification OTP is: ${otp}`;
    await sendEmail({
      email: user.email,
      subject: "Email Verification OTP",
      message,
    });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
// Login user
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorResponse("Please provide email and password", 400));
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }
    if (!user.isVerified)
      return next(new ErrorResponse("Please verify your email first", 401));
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  try {
    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpire: { $gt: Date.now() },
    });
    if (!user) return next(new ErrorResponse("Invalid or expired OTP", 400));
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new ErrorResponse("No user with that email", 404));
    const resetToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${req.protocol}://${req.get("host")}/reset
password/${resetToken}`;
    const message = `You requested a password reset. Click: ${resetUrl}`;
    await sendEmail({ email: user.email, subject: "Password Reset", message });
    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    next(new ErrorResponse("Email could not be sent", 500));
  }
};
// Reset password
exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });
    if (!user) return next(new ErrorResponse("Invalid token", 400));
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
