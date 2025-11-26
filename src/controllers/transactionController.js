const { sendResponse, handleError } = require("../utils/utils");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  createTransaction,
  getAllTransactions,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus,
  processPayment,
  getTransactionStats,
} = require("../services/transactionService");

// Create Transaction
exports.createTransaction = catchAsyncError(async (req, res) => {
  try {
    const data = await createTransaction(req.body);
    sendResponse(
      res,
      201,
      true,
      "Transaction created successfully",
      data,
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Get All Transactions (Admin)
exports.getAllTransactions = catchAsyncError(async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      method: req.query.method,
      user_id: req.query.user_id,
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder || "DESC",
    };

    const data = await getAllTransactions(filters);
    sendResponse(
      res,
      200,
      true,
      "Transactions fetched successfully",
      data,
      false
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Get User Transactions (Current User)
exports.getUserTransactions = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder || "DESC",
    };

    const data = await getUserTransactions(userId, filters);
    sendResponse(
      res,
      200,
      true,
      "Transactions fetched successfully",
      data,
      false
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Get Single Transaction by ID
exports.getTransactionById = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role?.name === "ADMIN";

    const data = await getTransactionById(req.params.id, userId, isAdmin);
    sendResponse(
      res,
      200,
      true,
      "Transaction fetched successfully",
      data,
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Update Transaction Status (Admin)
exports.updateTransactionStatus = catchAsyncError(async (req, res) => {
  try {
    const { status, metadata } = req.body;

    if (!status) {
      return sendResponse(res, 400, false, "Status is required");
    }

    const data = await updateTransactionStatus(req.params.id, status, metadata);
    sendResponse(
      res,
      202,
      true,
      "Transaction status updated successfully",
      data,
      true
    );
  } catch (error) {
    handleError(res, error);
  }
});

// Process Payment
exports.processPayment = catchAsyncError(async (req, res) => {
  try {
    const { payment_details } = req.body;

    if (!payment_details) {
      return sendResponse(res, 400, false, "Payment details are required");
    }

    const data = await processPayment(req.params.id, payment_details);

    if (data.success) {
      sendResponse(res, 200, true, data.message, data.transaction, true);
    } else {
      sendResponse(res, 400, false, data.message, data.transaction, true);
    }
  } catch (error) {
    handleError(res, error);
  }
});

// Get Transaction Stats (Admin Dashboard)
exports.getTransactionStats = catchAsyncError(async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const data = await getTransactionStats(filters);
    sendResponse(
      res,
      200,
      true,
      "Transaction stats fetched successfully",
      data,
      false
    );
  } catch (error) {
    handleError(res, error);
  }
});
