const express = require("express");
const orderRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

orderRouter
  .post("/", isAuthorized("create_order"), createOrder)
  .get("/", isAuthorized("manage_orders"), getAllOrders)
  .get("/my-orders", isAuthorized("view_own_orders"), getUserOrders)
  .get("/:id", isAuthorized("view_order"), getOrderById)
  .patch("/:id/status", isAuthorized("manage_orders"), updateOrderStatus)
  .post("/:id/cancel", isAuthorized("cancel_order"), cancelOrder);

module.exports = orderRouter;
