"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("transactions", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
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
        type: Sequelize.ENUM(
          "STRIPE",
          "PAYPAL",
          "CASH_ON_DELIVERY",
          "BANK_TRANSFER"
        ),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes
    await queryInterface.addIndex("transactions", ["order_id"], {
      name: "transactions_order_id_idx",
      unique: true,
    });

    await queryInterface.addIndex("transactions", ["status"], {
      name: "transactions_status_idx",
    });

    await queryInterface.addIndex("transactions", ["method"], {
      name: "transactions_method_idx",
    });

    await queryInterface.addIndex("transactions", ["transaction_id"], {
      name: "transactions_transaction_id_idx",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("transactions");
  },
};
