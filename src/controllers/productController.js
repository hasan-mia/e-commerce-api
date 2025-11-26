const { sendResponse, handleError } = require("../utils/utils");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
} = require("../services/productService");

// Create Product
exports.createProduct = catchAsyncError(async (req, res) => {
  try {
    const data = await createProduct(req.body);
    sendResponse(res, 201, true, "Product created successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Get All Products with Pagination and Filters
exports.getAllProducts = catchAsyncError(async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search,
      category_id: req.query.category_id,
      min_price: req.query.min_price
        ? parseFloat(req.query.min_price)
        : undefined,
      max_price: req.query.max_price
        ? parseFloat(req.query.max_price)
        : undefined,
      status: req.query.status,
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder || "DESC",
    };

    const data = await getAllProducts(filters);
    sendResponse(res, 200, true, "Products fetched successfully", data, false);
  } catch (error) {
    handleError(res, error);
  }
});

// Get Single Product by ID
exports.getProductById = catchAsyncError(async (req, res) => {
  try {
    const data = await getProductById(req.params.id);
    sendResponse(res, 200, true, "Product fetched successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Update Product by ID
exports.updateProduct = catchAsyncError(async (req, res) => {
  try {
    const data = await updateProduct(req.params.id, req.body);
    sendResponse(res, 202, true, "Product updated successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete Product by ID
exports.deleteProduct = catchAsyncError(async (req, res) => {
  try {
    const result = await deleteProduct(req.params.id);
    sendResponse(res, 200, true, result.message);
  } catch (error) {
    handleError(res, error);
  }
});

// Update Product Stock
exports.updateStock = catchAsyncError(async (req, res) => {
  try {
    const { quantity, operation } = req.body;

    if (!quantity || !operation) {
      return sendResponse(
        res,
        400,
        false,
        "Quantity and operation are required"
      );
    }

    const data = await updateStock(
      req.params.id,
      parseInt(quantity),
      operation
    );
    sendResponse(res, 202, true, "Stock updated successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});
