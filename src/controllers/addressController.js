const catchAsyncError = require("../middleware/catchAsyncError");
const { upsertAddress, getAddressById } = require("../services/addressService");
const { sendResponse, handleError } = require("../utils/utils");

// Create Address
exports.upsertAddress = catchAsyncError(async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  try {
    const data = await upsertAddress(userId, req.body);
    sendResponse(res, 201, true, "Address update successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Get Single Address by ID
exports.getAddressById = catchAsyncError(async (req, res) => {
  try {
    const data = await getAddressById(req.user.id);
    sendResponse(res, 200, true, "Address fetched successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});
