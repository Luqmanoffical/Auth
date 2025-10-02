const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
// Load env vars
require("dotenv").config();
// Connect to database
connectDB();
// Route files
const auth = require("./routes/authRoutes");
const app = express();
// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());
// Sanitize data
// app.use(mongoSanitize());
// Set security headers
app.use(helmet());
// Prevent XSS attacks
// app.use(xss());
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
  message: "Too many login attempts. Try again in 5 minutes.",
});
app.use(limiter);
// Prevent http param pollution
app.use(hpp());
// Enable CORS
app.use(cors());

// {
//   origin: process.env.CLIENT_URL,
//   credentials: true,
// }

// Mount routers
app.use("/api/v1/auth", auth);
// Error handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
