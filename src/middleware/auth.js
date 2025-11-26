const { User, Permission, Role } = require("../models");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("./catchAsyncError");
const { ErrorHandler } = require("../utils/utils");
const util = require("util");

const verifyToken = util.promisify(jwt.verify);

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next(new ErrorHandler("Unauthorized: No token provided", 401));
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new ErrorHandler("Access token required", 401));
  }

  try {
    const decoded = await verifyToken(token, process.env.JWT_SECRET);
    req.user = decoded;

    const writeOperations = ["POST", "PUT", "PATCH", "DELETE"];
    if (
      writeOperations.includes(req.method) &&
      req.user.email === "demo@gmail.com"
    ) {
      return next(new ErrorHandler("Demo account has read-only access", 403));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired access token", 403));
  }
});

exports.isAuthorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated", 403));
    }

    const userRoles = req.user.roles || [];

    const isAuthorized = roles.some((role) => userRoles.includes(role));
    if (!isAuthorized) {
      return next(
        new ErrorHandler(
          "Access denied. Required roles: " + roles.join(", "),
          403
        )
      );
    }

    next();
  };
};

exports.isAuthorized = (requiredAction) => {
  return [
    exports.isAuthenticated,
    catchAsyncError(async (req, res, next) => {
      if (!req.user) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password", "deletedAt"] },
        include: {
          model: Role,
          as: "role",
          attributes: ["id", "score"],
        },
      });

      if (!user || !user.role) {
        return next(new ErrorHandler("User role not found", 403));
      }

      req.user.roleId = user.role.id;
      req.user.score = user.role.score;

      const permission = await Permission.findOne({
        where: { action: requiredAction },
      });

      if (!permission) {
        return next(new ErrorHandler("Action not permitted", 403));
      }

      if (user.role.score < permission.required_score) {
        return res.status(403).json({
          message: "Insufficient permissions",
          requiredScore: permission.required_score,
          currentScore: user.role.score,
        });
      }

      next();
    }),
  ];
};

exports.refreshToken = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ErrorHandler("Refresh token required", 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }

    const accessToken = jwt.sign(
      { id: user.id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return next(
      new ErrorHandler(error.message || "Invalid refresh token", 403)
    );
  }
});
