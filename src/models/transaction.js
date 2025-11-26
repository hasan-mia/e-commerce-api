"use strict";

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "orders",
          key: "id",
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Amount must be greater than or equal to 0",
          },
        },
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "COMPLETED",
          "FAILED",
          "REFUNDED",
          "CANCELLED"
        ),
        defaultValue: "PENDING",
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM(
          "STRIPE",
          "PAYPAL",
          "CASH_ON_DELIVERY",
          "BANK_TRANSFER"
        ),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Payment gateway transaction ID",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional payment metadata",
      },
    },
    {
      tableName: "transactions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Order, {
      foreignKey: "order_id",
      as: "order",
    });
  };

  return Transaction;
};
