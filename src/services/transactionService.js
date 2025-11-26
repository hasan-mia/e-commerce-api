const { Transaction, Order, User, OrderItem, Product } = require("../models");
const { ErrorHandler } = require("../utils/utils");
const { Op } = require("sequelize");

// Create Transaction (usually done automatically with order creation)
const createTransaction = async (data) => {
  try {
    const { order_id, amount, method, transaction_id, metadata } = data;

    if (!order_id || !amount || !method) {
      throw new ErrorHandler("Order ID, amount, and method are required", 400);
    }

    // Verify order exists
    const order = await Order.findByPk(order_id);
    if (!order) {
      throw new ErrorHandler("Order not found", 404);
    }

    // Check if transaction already exists for this order
    const existingTransaction = await Transaction.findOne({
      where: { order_id },
    });
    if (existingTransaction) {
      throw new ErrorHandler("Transaction already exists for this order", 400);
    }

    // Validate data
    const validAttributes = Object.keys(Transaction.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    const transaction = await Transaction.create({
      order_id,
      amount,
      status: "PENDING",
      method,
      transaction_id,
      metadata,
    });

    // Reload with order
    const transactionWithOrder = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "user_id", "status", "total_amount"],
        },
      ],
    });

    return transactionWithOrder;
  } catch (error) {
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

// Get All Transactions (Admin)
const getAllTransactions = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      user_id,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const orderWhere = {};

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Method filter
    if (method) {
      whereClause.method = method;
    }

    // User filter
    if (user_id) {
      orderWhere.user_id = user_id;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: "order",
          where: Object.keys(orderWhere).length > 0 ? orderWhere : undefined,
          attributes: ["id", "user_id", "status", "total_amount", "created_at"],
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
                  attributes: ["id", "name", "image"],
                },
              ],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return {
      transactions: rows,
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

// Get User Transactions
const getUserTransactions = async (userId, filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: "order",
          where: { user_id: userId },
          attributes: ["id", "status", "total_amount", "created_at"],
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
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return {
      transactions: rows,
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

// Get Transaction by ID
const getTransactionById = async (
  transactionId,
  userId = null,
  isAdmin = false
) => {
  try {
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: [
            "id",
            "user_id",
            "status",
            "total_amount",
            "shipping_address",
            "created_at",
          ],
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
          ],
        },
      ],
    });

    if (!transaction) {
      throw new ErrorHandler("Transaction not found", 404);
    }

    // Check if user owns this transaction (if not admin)
    if (!isAdmin && userId && transaction.order.user_id !== userId) {
      throw new ErrorHandler("Unauthorized access to this transaction", 403);
    }

    return transaction;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Update Transaction Status
const updateTransactionStatus = async (
  transactionId,
  status,
  metadata = null
) => {
  try {
    const validStatuses = [
      "PENDING",
      "COMPLETED",
      "FAILED",
      "REFUNDED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      throw new ErrorHandler("Invalid transaction status", 400);
    }

    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: Order,
          as: "order",
        },
      ],
    });

    if (!transaction) {
      throw new ErrorHandler("Transaction not found", 404);
    }

    const updateData = { status };

    // Add metadata if provided
    if (metadata) {
      updateData.metadata = {
        ...(transaction.metadata || {}),
        ...metadata,
      };
    }

    // Update order status based on transaction status
    if (transaction.order) {
      let orderStatus = transaction.order.status;

      if (status === "COMPLETED" && transaction.order.status === "PENDING") {
        orderStatus = "PROCESSING";
      } else if (status === "FAILED" || status === "CANCELLED") {
        orderStatus = "CANCELLED";
      }

      await transaction.order.update({ status: orderStatus });
    }

    await transaction.update(updateData);

    // Reload with associations
    const updatedTransaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "user_id", "status", "total_amount"],
        },
      ],
    });

    return updatedTransaction;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Process Payment (Stripe/PayPal integration placeholder)
const processPayment = async (transactionId, paymentDetails) => {
  try {
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: Order,
          as: "order",
        },
      ],
    });

    if (!transaction) {
      throw new ErrorHandler("Transaction not found", 404);
    }

    if (transaction.status !== "PENDING") {
      throw new ErrorHandler("Transaction is not in pending state", 400);
    }

    // TODO: Integrate with actual payment gateway (Stripe/PayPal)
    // This is a placeholder for payment processing logic

    // Simulate payment processing
    const paymentSuccess = true; // Replace with actual payment gateway response

    if (paymentSuccess) {
      await transaction.update({
        status: "COMPLETED",
        transaction_id: paymentDetails.transaction_id || `TXN_${Date.now()}`,
        metadata: {
          ...(transaction.metadata || {}),
          payment_details: paymentDetails,
          processed_at: new Date(),
        },
      });

      // Update order status
      await transaction.order.update({
        status: "PROCESSING",
      });

      return {
        success: true,
        message: "Payment processed successfully",
        transaction,
      };
    } else {
      await transaction.update({
        status: "FAILED",
        metadata: {
          ...(transaction.metadata || {}),
          error: "Payment failed",
          failed_at: new Date(),
        },
      });

      return {
        success: false,
        message: "Payment failed",
        transaction,
      };
    }
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Get Transaction Stats (Admin)
const getTransactionStats = async (filters = {}) => {
  try {
    const { start_date, end_date } = filters;
    const whereClause = {};

    if (start_date || end_date) {
      whereClause.created_at = {};
      if (start_date) whereClause.created_at[Op.gte] = new Date(start_date);
      if (end_date) whereClause.created_at[Op.lte] = new Date(end_date);
    }

    // Total transactions
    const totalTransactions = await Transaction.count({
      where: whereClause,
    });

    // Total amount by status
    const completedTransactions = await Transaction.findAll({
      where: {
        ...whereClause,
        status: "COMPLETED",
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      raw: true,
    });

    // Count by status
    const statusCounts = await Transaction.findAll({
      where: whereClause,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Count by method
    const methodCounts = await Transaction.findAll({
      where: whereClause,
      attributes: [
        "method",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["method"],
      raw: true,
    });

    return {
      total_transactions: totalTransactions,
      completed_amount: completedTransactions[0]?.total_amount || 0,
      completed_count: completedTransactions[0]?.count || 0,
      by_status: statusCounts,
      by_method: methodCounts,
    };
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus,
  processPayment,
  getTransactionStats,
};
