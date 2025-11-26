const {
  registerUser,
  loginUser,
  updatePassword,
  resetPassword,
  getProfile,
  forgotPassword,
  updateProfile,
} = require("../services/authService");

const catchAsyncError = require("../middleware/catchAsyncError");
const { sendResponse, handleError } = require("../utils/utils");
const { generateJWT } = require("../utils/helper");

// Register Controller
exports.register = catchAsyncError(async (req, res) => {
  try {
    const { user, permissions } = await registerUser(req.body);

    const { id } = user;

    const responseUser = {
      id,
      email: user.email,
      name: user.name,
      role_id: user.role_id,
      role: user.role,
      avatar: user.avatar,
    };

    // Generate tokens
    const accessToken = generateJWT(responseUser);
    const refreshToken = generateJWT({ id }, "7d");

    sendResponse(
      res,
      201,
      true,
      "User registered successfully",
      {
        user: responseUser,
        permissions,
        accessToken,
        refreshToken,
      },
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Login Controller
exports.login = catchAsyncError(async (req, res) => {
  try {
    const { user, permissions } = await loginUser(req.body);
    const { id } = user;

    const responseUser = {
      id,
      email: user.email,
      name: user.name,
      role_id: user.role_id,
      role: user.role,
      avatar: user.avatar,
    };

    // Generate tokens
    const accessToken = generateJWT(responseUser);
    const refreshToken = generateJWT({ id }, "7d");

    sendResponse(
      res,
      200,
      true,
      "Login successful",
      {
        user: responseUser,
        permissions,
        accessToken,
        refreshToken,
      },
      false
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Update Password Controller (when user knows current password)
exports.changePassword = catchAsyncError(async (req, res) => {
  const userId = req.user.id;

  try {
    const { message } = await updatePassword(userId, req.body);

    sendResponse(res, 200, true, message, null, false);
  } catch (error) {
    handleError(res, error);
  }
});

// Forgot Password Controller (Request reset link)
exports.forgotPassword = catchAsyncError(async (req, res) => {
  const { identifier, type = "email" } = req.body;

  try {
    // Validate required fields
    if (!identifier) {
      return sendResponse(res, 400, false, "Email or phone number is required");
    }

    // Validate type
    if (!["email", "phone"].includes(type)) {
      return sendResponse(res, 400, false, "Type must be 'email' or 'phone'");
    }

    const result = await forgotPassword(identifier, type);

    sendResponse(
      res,
      200,
      true,
      result.message,
      {
        method: result.method,
        // Include link in development for testing
        ...(process.env.NODE_ENV === "development" && {
          verifyLink: result.verifyLink,
        }),
      },
      false
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Reset Password Controller (when user forgets password)
exports.resetPassword = catchAsyncError(async (req, res) => {
  const userId = req.user.id;

  try {
    const { message } = await resetPassword(userId, req.body);

    sendResponse(res, 200, true, message, null, false);
  } catch (error) {
    handleError(res, error);
  }
});

// Update Profile Controller
exports.updateProfile = catchAsyncError(async (req, res) => {
  const userId = req.user.id;

  try {
    const data = await updateProfile(userId, req.body);

    sendResponse(res, 200, true, "Profile updated successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Get Current User Profile Controller
exports.getProfile = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await getProfile(userId);

    sendResponse(res, 200, true, "Profile retrieved successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});
