const express = require("express");
const transactionRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  createTransaction,
  getAllTransactions,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus,
  processPayment,
  getTransactionStats,
} = require("../controllers/transactionController");

transactionRouter
  .post("/", isAuthorized("manage_transactions"), createTransaction)
  .get("/", isAuthorized("manage_transactions"), getAllTransactions)
  .get("/stats", isAuthorized("manage_transactions"), getTransactionStats)
  .get(
    "/my-transactions",
    isAuthorized("view_own_transactions"),
    getUserTransactions
  )
  .get("/:id", isAuthorized("manage_transactions"), getTransactionById)
  .patch(
    "/:id/status",
    isAuthorized("manage_transactions"),
    updateTransactionStatus
  )
  .post("/:id/process", isAuthorized("manage_transactions"), processPayment);

module.exports = transactionRouter;
