const { sendResponse, handleError } = require("../utils/utils");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  createHero,
  getAllHeroes,
  getActiveHeroes,
  getHeroById,
  updateHero,
  updateHeroOrder,
  reorderHeroes,
  deleteHero,
  toggleHeroStatus,
} = require("../services/heroService");

// Create Hero Slide
exports.createHero = catchAsyncError(async (req, res) => {
  try {
    const data = await createHero(req.body);
    sendResponse(res, 201, true, "Hero slide created successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Get All Hero Slides with Pagination (Admin)
exports.getAllHeroes = catchAsyncError(async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || "order",
      sortOrder: req.query.sortOrder || "ASC",
    };

    const data = await getAllHeroes(filters);
    sendResponse(
      res,
      200,
      true,
      "Hero slides fetched successfully",
      data,
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Get Active Hero Slides (Public - Frontend)
exports.getActiveHeroes = catchAsyncError(async (req, res) => {
  try {
    const data = await getActiveHeroes();
    sendResponse(
      res,
      200,
      true,
      "Active hero slides fetched successfully",
      data,
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Get Single Hero by ID
exports.getHeroById = catchAsyncError(async (req, res) => {
  try {
    const data = await getHeroById(req.params.id);
    sendResponse(res, 200, true, "Hero slide fetched successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Update Hero by ID
exports.updateHero = catchAsyncError(async (req, res) => {
  try {
    const data = await updateHero(req.params.id, req.body);
    sendResponse(res, 202, true, "Hero slide updated successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Update Hero Order
exports.updateHeroOrder = catchAsyncError(async (req, res) => {
  try {
    const { order } = req.body;

    if (order === undefined || order === null) {
      return sendResponse(res, 400, false, "Order value is required");
    }

    const data = await updateHeroOrder(req.params.id, parseInt(order));
    sendResponse(res, 202, true, "Hero order updated successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Reorder Heroes (Bulk Update)
exports.reorderHeroes = catchAsyncError(async (req, res) => {
  try {
    const { orderArray } = req.body;

    if (!orderArray || !Array.isArray(orderArray)) {
      return sendResponse(
        res,
        400,
        false,
        "Order array is required and must be an array"
      );
    }

    const data = await reorderHeroes(orderArray);
    sendResponse(res, 202, true, "Heroes reordered successfully", data, false);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete Hero by ID
exports.deleteHero = catchAsyncError(async (req, res) => {
  try {
    const result = await deleteHero(req.params.id);
    sendResponse(res, 200, true, result.message);
  } catch (error) {
    handleError(res, error);
  }
});

// Toggle Hero Status
exports.toggleHeroStatus = catchAsyncError(async (req, res) => {
  try {
    const data = await toggleHeroStatus(req.params.id);
    sendResponse(
      res,
      202,
      true,
      "Hero status toggled successfully",
      data,
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});
