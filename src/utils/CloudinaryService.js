const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param {fileUpload.UploadedFile} file
   * @returns {Promise} Upload result
   */
  async uploadFile(file) {
    return new Promise((resolve, reject) => {
      // Check if file is an image
      const isImage = file.mimetype && file.mimetype.startsWith("image/");

      const uploadOptions = isImage
        ? {
            format: "webp",
            quality: "auto",
            fetch_format: "auto",
          }
        : {};

      const upload = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(file.data).pipe(upload);
    });
  }

  /**
   * Upload video to Cloudinary with transformations
   * @param {fileUpload.UploadedFile} file - The uploaded video file
   * @returns {Promise} Upload result
   */

  async uploadVideo(file) {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          eager: [
            {
              streaming_profile: "hd",
              format: "m3u8",
            },
            {
              streaming_profile: "sd",
              format: "m3u8",
            },
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(file.data).pipe(upload);
    });
  }

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - The public ID of the file to delete
   * @param {string} resourceType - The resource type ('image', 'video', 'raw')
   * @returns {Promise} Delete result
   */
  async deleteFile(publicId, resourceType = "image") {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          console.log(publicId, result);
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  }
}

module.exports = CloudinaryService;
