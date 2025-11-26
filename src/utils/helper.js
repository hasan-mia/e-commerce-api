const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { Booking } = require("../models");
const { ErrorHandler } = require("./utils");
const generateJWT = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || "1500m",
  JWT
) => {
  return jwt.sign(payload, JWT ?? process.env.JWT_SECRET, { expiresIn });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOrderNumber = (prefix = "ORD") => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(3).toString("hex");
  return `${prefix}${timestamp.toUpperCase()}${randomPart.toUpperCase()}`;
};

const extractPublicIdFromUrl = async (url) => {
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) {
      throw new ErrorHandler("Please enter valid url", 400);
    }

    const pathAfterUpload = url.substring(uploadIndex + 8);
    const parts = pathAfterUpload.split("/");

    // Remove version if it starts with "v" and is numeric
    if (parts[0].startsWith("v") && /^\d+$/.test(parts[0].substring(1))) {
      parts.shift();
    }

    const filenameWithExt = parts.pop();
    const filename = filenameWithExt.replace(/\.[^/.]+$/, "");
    parts.push(filename);

    return parts.join("/");
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

const generateConfirmationCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 9; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const formatDateTime = (date, time, timezone) => {
  const [timeStr, period] = time.split(" ");
  const [hours, minutes] = timeStr.split(":").map(Number);
  let hour24 = hours;

  if (period === "PM" && hours !== 12) hour24 += 12;
  if (period === "AM" && hours === 12) hour24 = 0;

  const dateStr = new Date(date).toISOString().split("T")[0];
  return `${dateStr}T${hour24.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
};

const generateBookingNumber = async () => {
  const prefix = "BK";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Find the last booking number for today
  const lastBooking = await Booking.findOne({
    where: {
      booking_number: {
        [Op.like]: `${prefix}-${year}${month}%`,
      },
    },
    order: [["created_at", "DESC"]],
  });

  let sequence = 1;
  if (lastBooking) {
    const lastSequence = parseInt(lastBooking.booking_number.split("-")[2]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${year}${month}${String(sequence).padStart(6, "0")}`;
};

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
};

const isValidateData = (rawAttributes, data) => {
  const validAttributes = Object.keys(rawAttributes);
  const invalidKeys = Object.keys(data).filter(
    (key) => !validAttributes.includes(key)
  );
  if (invalidKeys.length > 0) {
    return `${invalidKeys.join(", ")} is not a valid field`, 400;
  }
};

module.exports = {
  generateJWT,
  generateOtp,
  generateOrderNumber,
  extractPublicIdFromUrl,
  generateConfirmationCode,
  formatDateTime,
  generateBookingNumber,
  generateSlug,
  isValidateData,
};
