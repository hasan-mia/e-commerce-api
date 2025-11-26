"use strict";

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
          "REFUNDED"
        ),
        defaultValue: "PENDING",
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM(
          "STRIPE",
          "PAYPAL",
          "CASH_ON_DELIVERY",
          "BANK_TRANSFER"
        ),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Total amount must be greater than or equal to 0",
          },
        },
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tracking_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "orders",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: "order_id",
      as: "items",
    });
    Order.hasOne(models.Transaction, {
      foreignKey: "order_id",
      as: "transaction",
    });
  };

  return Order;
};
