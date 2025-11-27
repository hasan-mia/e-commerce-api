const express = require("express");
const orderRouter = express.Router();
const { isAuthorized, isAuthenticated } = require("../middleware/auth");
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

orderRouter
  .post("/", isAuthenticated, createOrder)
  .get("/", isAuthorized("manage_orders"), getAllOrders)
  .get("/my-orders", isAuthenticated, getUserOrders)
  .get("/:id", isAuthenticated, getOrderById)
  .put("/:id/status", isAuthorized("manage_orders"), updateOrderStatus)
  .post("/:id/cancel", isAuthorized("manage_orders"), cancelOrder);

module.exports = orderRouter;
