require("dotenv").config();
const express = require("express");
const { sendResponse, ErrorHandler } = require("../utils/utils");
const { isAuthenticated } = require("../middleware/auth");
const CloudinaryService = require("../utils/CloudinaryService");
const { extractPublicIdFromUrl } = require("../utils/helper");
const fileRouter = express.Router();

fileRouter.post("/upload", isAuthenticated, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return sendResponse(res, 400, false, "No file uploaded");
    }

    const cloudinaryService = new CloudinaryService();
    const files = req.files.file;

    // Check if single file or multiple files
    const isSingleFile = !Array.isArray(files);

    if (isSingleFile) {
      // Handle single file upload
      const data = await cloudinaryService.uploadFile(files);

      if (process.env.NODE_ENV !== "production") {
        console.log("Cloudinary response:", data);
      }

      const fileUrl = data.secure_url || data.url;
      if (!fileUrl) {
        return sendResponse(
          res,
          500,
          false,
          "Cloudinary did not return a file URL"
        );
      }

      return sendResponse(
        res,
        200,
        true,
        "File uploaded successfully",
        fileUrl,
        true
      );
    } else {
      // Handle multiple files upload
      const uploadResults = await cloudinaryService.uploadMultipleFiles(files);

      if (process.env.NODE_ENV !== "production") {
        console.log("Cloudinary responses:", uploadResults);
      }

      // Extract URLs from results
      const fileUrls = uploadResults.map((data) => {
        const fileUrl = data.secure_url || data.url;
        if (!fileUrl) {
          throw new Error("Cloudinary did not return a file URL");
        }
        return fileUrl;
      });

      return sendResponse(
        res,
        200,
        true,
        `${fileUrls.length} file(s) uploaded successfully`,
        fileUrls,
        true
      );
    }
  } catch (error) {
    console.error("File upload error:", error);

    if (error instanceof ErrorHandler) {
      return sendResponse(res, error.statusCode, false, error.message);
    }

    return sendResponse(res, 500, false, error.message || "File upload failed");
  }
});

fileRouter.delete("/delete", isAuthenticated, async (req, res) => {
  const { url, resourceType = "image" } = req.query;
  try {
    const publicKey = await extractPublicIdFromUrl(url);

    const cloudinaryService = new CloudinaryService();
    const deleted = await cloudinaryService.deleteFile(publicKey, resourceType);
    if (!deleted) {
      return sendResponse(res, 403, false, "Failed to deleted file");
    }

    sendResponse(res, 200, true, "File deleted successfully", deleted);
  } catch (error) {
    console.error("Upload handler error:", error);
    if (error instanceof ErrorHandler) {
      return sendResponse(res, error.statusCode, false, error.message);
    }
    return sendResponse(res, 500, false, error.message);
  }
});

fileRouter.post("/video", isAuthenticated, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const cloudinaryService = new CloudinaryService();
    const data = await cloudinaryService.uploadVideo(req.files.file);

    if (!data) {
      return sendResponse(res, 403, false, "Failed to uploaded file");
    }
    sendResponse(
      res,
      200,
      true,
      "File upload successfully",
      data.playback_url,
      true
    );
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return sendResponse(res, error.statusCode, false, error.message);
    }
    return sendResponse(res, 500, false, error.message);
  }
});

module.exports = fileRouter;
