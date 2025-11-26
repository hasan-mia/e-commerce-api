const AWS = require("aws-sdk");
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACE_URL);

const bucketName = process.env.DO_BUCKET_NAME;

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_SECRET_KEY,
  region: process.env.DO_REGION,
  sslEnabled: true,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FILE_TYPE = {
  image: ["image/jpeg", "image/png", "image/jpg"],
  video: ["video/mp4", "video/mpeg"],
  document: ["application/pdf", "application/msword"],
};

const validateFile = (file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File too large");
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error("Invalid file type");
    }
  } catch (error) {
    return error;
  }
};

const isImage = async (file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File too large");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error("Please upload png, jpg or gpeg file");
    }
  } catch (error) {
    return error;
  }
};

const getKeyFromUrl = async (url) => {
  const parsedUrl = new URL(url);
  return parsedUrl.pathname.substring(1);
};

const uploadFile = async ({
  file,
  folder = "others",
  userId = "roshoon",
  type,
  description = "Roshon file",
}) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds the limit of ${MAX_FILE_SIZE / 1024 / 1024} MB.`
    );
  }

  if (type) {
    if (!FILE_TYPE[type] || !FILE_TYPE[type].includes(file.mimetype)) {
      throw new Error(`Invalid file type for ${type}.`);
    }
  }

  const env = process.env.NODE_ENV || "dev";
  const randomNumber = Math.floor(Math.random() * 1000000);
  const sanitizedFileName = file.name.replace(/\s+/g, "-").toLowerCase();
  const fileName = `${userId}_${env}_${randomNumber}_${sanitizedFileName}`;
  const key = `${folder}/${fileName}`;

  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: "public-read",
      Metadata: {
        "Original-Filename": sanitizedFileName,
        "User-Id": `${userId}`,
        Type: type || "file",
        Description: description,
      },
    };

    await s3.upload(params).promise();

    return {
      fileUrl: `https://${bucketName}.nyc3.digitaloceanspaces.com/${key}`,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(error.message);
  }
};

const deleteFile = async ({ key, folder }) => {
  try {
    if (!key) {
      throw new Error("File key is required");
    }
    if (!folder) {
      throw new Error("Folder name is required");
    }
    const Key = folder + "/" + key;

    const params = {
      Bucket: bucketName,
      Key: Key,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error(error.message);
  }
};

module.exports = {
  validateFile,
  uploadFile,
  deleteFile,
  isImage,
  getKeyFromUrl,
};
