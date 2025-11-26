"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.ENUM(
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
        type: Sequelize.ENUM(
          "STRIPE",
          "PAYPAL",
          "CASH_ON_DELIVERY",
          "BANK_TRANSFER"
        ),
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      shipping_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tracking_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex("orders", ["user_id"], {
      name: "orders_user_id_idx",
    });

    await queryInterface.addIndex("orders", ["status"], {
      name: "orders_status_idx",
    });

    await queryInterface.addIndex("orders", ["payment_method"], {
      name: "orders_payment_method_idx",
    });

    await queryInterface.addIndex("orders", ["created_at"], {
      name: "orders_created_at_idx",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("orders");
  },
};
