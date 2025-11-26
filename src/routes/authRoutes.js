const express = require("express");
const authRouter = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const otpRateLimiter = require("../middleware/otpRateLimiter");
const {
  register,
  login,
  changePassword,
  resetPassword,
  forgotPassword,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

/*============================================
 * Public routes (no authentication required)
 =============================================*/

authRouter
  .post("/register", register)
  .post("/login", login)
  .post("/forgot-password", otpRateLimiter, forgotPassword);

/*============================================
 *  Protected routes (authentication required)
 =============================================*/

authRouter
  .post("/reset-password", isAuthenticated, resetPassword)
  .post("/change-password", isAuthenticated, changePassword)
  .get("/me", isAuthenticated, getProfile)
  .put("/profile", isAuthenticated, updateProfile);

module.exports = authRouter;
