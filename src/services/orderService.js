const {
  Order,
  OrderItem,
  Product,
  User,
  Transaction,
  sequelize,
} = require("../models");
const { ErrorHandler } = require("../utils/utils");
const { Op } = require("sequelize");

// Create Order
const createOrder = async (userId, data) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, payment_method, shipping_address, notes } = data;

    if (!items || items.length === 0) {
      throw new ErrorHandler("Order must contain at least one item", 400);
    }

    if (!payment_method || !shipping_address) {
      throw new ErrorHandler(
        "Payment method and shipping address are required",
        400
      );
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate products and calculate total
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);

      if (!product) {
        throw new ErrorHandler(
          `Product with ID ${item.product_id} not found`,
          404
        );
      }

      if (product.status !== "active") {
        throw new ErrorHandler(`Product ${product.name} is not available`, 400);
      }

      if (product.stock < item.quantity) {
        throw new ErrorHandler(
          `Insufficient stock for product ${product.name}`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      // Reduce stock
      await product.update(
        {
          stock: product.stock - item.quantity,
          status:
            product.stock - item.quantity === 0
              ? "out_of_stock"
              : product.status,
        },
        { transaction }
      );
    }

    // Create order
    const order = await Order.create(
      {
        user_id: userId,
        status: "PENDING",
        payment_method,
        total_amount: totalAmount,
        shipping_address,
        notes,
      },
      { transaction }
    );

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create(
        {
          order_id: order.id,
          ...item,
        },
        { transaction }
      );
    }

    // Create transaction
    await Transaction.create(
      {
        order_id: order.id,
        amount: totalAmount,
        status: payment_method === "CASH_ON_DELIVERY" ? "PENDING" : "PENDING",
        method: payment_method,
      },
      { transaction }
    );

    await transaction.commit();

    // Fetch complete order
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
        },
      ],
    });

    return completeOrder;
  } catch (error) {
    await transaction.rollback();
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const validationMessages = error.errors.map((e) => e.message).join(", ");
      throw new ErrorHandler(validationMessages, error.statusCode || 400);
    }
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Get All Orders (Admin)
const getAllOrders = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      payment_method,
      user_id,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Payment method filter
    if (payment_method) {
      whereClause.payment_method = payment_method;
    }

    // User filter
    if (user_id) {
      whereClause.user_id = user_id;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return {
      orders: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Get User Orders
const getUserOrders = async (userId, filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = { user_id: userId };

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return {
      orders: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Get Order by ID
const getOrderById = async (orderId, userId = null, isAdmin = false) => {
  try {
    const whereClause = { id: orderId };

    // Non-admin users can only see their own orders
    if (!isAdmin && userId) {
      whereClause.user_id = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone", "address"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: [
                "id",
                "name",
                "description",
                "image",
                "price",
                "stock",
              ],
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
        },
      ],
    });

    if (!order) {
      throw new ErrorHandler("Order not found", 404);
    }

    return order;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Update Order Status
const updateOrderStatus = async (orderId, status, tracking_number = null) => {
  try {
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ];

    if (!validStatuses.includes(status)) {
      throw new ErrorHandler("Invalid order status", 400);
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Transaction,
          as: "transaction",
        },
      ],
    });

    if (!order) {
      throw new ErrorHandler("Order not found", 404);
    }

    const updateData = { status };

    // Add tracking number if provided and status is SHIPPED
    if (tracking_number && status === "SHIPPED") {
      updateData.tracking_number = tracking_number;
    }

    // Update transaction status based on order status
    if (order.transaction) {
      let transactionStatus = order.transaction.status;

      if (status === "DELIVERED") {
        transactionStatus = "COMPLETED";
      } else if (status === "CANCELLED" || status === "REFUNDED") {
        transactionStatus = status === "CANCELLED" ? "CANCELLED" : "REFUNDED";
      }

      await order.transaction.update({ status: transactionStatus });
    }

    await order.update(updateData);

    // Reload with associations
    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
        },
      ],
    });

    return updatedOrder;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Cancel Order
const cancelOrder = async (orderId, userId = null, isAdmin = false) => {
  const transaction = await sequelize.transaction();

  try {
    const whereClause = { id: orderId };

    // Non-admin users can only cancel their own orders
    if (!isAdmin && userId) {
      whereClause.user_id = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
        },
      ],
    });

    if (!order) {
      throw new ErrorHandler("Order not found", 404);
    }

    // Can only cancel pending or processing orders
    if (!["PENDING", "PROCESSING"].includes(order.status)) {
      throw new ErrorHandler(
        "Only pending or processing orders can be cancelled",
        400
      );
    }

    // Restore product stock
    for (const item of order.items) {
      await item.product.update(
        {
          stock: item.product.stock + item.quantity,
          status: "active",
        },
        { transaction }
      );
    }

    // Update order status
    await order.update({ status: "CANCELLED" }, { transaction });

    // Update transaction status
    if (order.transaction) {
      await order.transaction.update({ status: "CANCELLED" }, { transaction });
    }

    await transaction.commit();

    // Reload order
    const cancelledOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
        },
      ],
    });

    return cancelledOrder;
  } catch (error) {
    await transaction.rollback();
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
