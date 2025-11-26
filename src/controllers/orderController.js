const { sendResponse, handleError } = require("../utils/utils");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../services/orderService");

// Create Order
exports.createOrder = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is attached to req by auth middleware
    const data = await createOrder(userId, req.body);
    sendResponse(res, 201, true, "Order created successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Get All Orders (Admin)
exports.getAllOrders = catchAsyncError(async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      payment_method: req.query.payment_method,
      user_id: req.query.user_id,
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder || "DESC",
    };

    const data = await getAllOrders(filters);
    sendResponse(res, 200, true, "Orders fetched successfully", data, false);
  } catch (error) {
    handleError(res, error);
  }
});

// Get User Orders (Current User)
exports.getUserOrders = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder || "DESC",
    };

    const data = await getUserOrders(userId, filters);
    sendResponse(res, 200, true, "Orders fetched successfully", data, false);
  } catch (error) {
    handleError(res, error);
  }
});

// Get Single Order by ID
exports.getOrderById = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role?.name === "ADMIN"; // Check if user is admin

    const data = await getOrderById(req.params.id, userId, isAdmin);
    sendResponse(res, 200, true, "Order fetched successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});

// Update Order Status (Admin)
exports.updateOrderStatus = catchAsyncError(async (req, res) => {
  try {
    const { status, tracking_number } = req.body;

    if (!status) {
      return sendResponse(res, 400, false, "Status is required");
    }

    const data = await updateOrderStatus(
      req.params.id,
      status,
      tracking_number
    );
    sendResponse(
      res,
      202,
      true,
      "Order status updated successfully",
      data,
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Cancel Order
exports.cancelOrder = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role?.name === "ADMIN";

    const data = await cancelOrder(req.params.id, userId, isAdmin);
    sendResponse(res, 200, true, "Order cancelled successfully", data, true);
  } catch (error) {
    handleError(res, error);
  }
});
