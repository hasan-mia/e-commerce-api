const { sendResponse, handleError } = require("../utils/utils");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
} = require("../services/categoryService");

// Create Category
exports.createCategory = catchAsyncError(async (req, res) => {
  try {
    const data = await createCategory(req.body);
    sendResponse(res, 201, true, "Category created successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Get All Categories with Pagination and Filters
exports.getAllCategories = catchAsyncError(async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search,
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder || "DESC",
    };

    const data = await getAllCategories(filters);
    sendResponse(
      res,
      200,
      true,
      "Categories fetched successfully",
      data,
      false
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Get Single Category by ID
exports.getCategoryById = catchAsyncError(async (req, res) => {
  try {
    const data = await getCategoryById(req.params.id);
    sendResponse(res, 200, true, "Category fetched successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Update Category by ID
exports.updateCategory = catchAsyncError(async (req, res) => {
  try {
    const data = await updateCategory(req.params.id, req.body);
    sendResponse(res, 202, true, "Category updated successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete Category by ID
exports.deleteCategory = catchAsyncError(async (req, res) => {
  try {
    const result = await deleteCategory(req.params.id);
    sendResponse(res, 200, true, result.message);
  } catch (error) {
    handleError(res, error);
  }
});
