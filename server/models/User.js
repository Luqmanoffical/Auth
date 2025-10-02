const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please add a name"] },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otp: String,
  otpExpire: Date,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
// Password hashing middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// JWT generation method
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// Password comparison method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Reset token generation
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};
// OTP generation
UserSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

module.exports = mongoose.model("User", UserSchema);
