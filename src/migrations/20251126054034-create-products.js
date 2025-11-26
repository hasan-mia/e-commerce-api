"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.0,
      },
      reviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "out_of_stock"),
        defaultValue: "active",
        allowNull: false,
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

    // Add indexes for better query performance
    await queryInterface.addIndex("products", ["category_id"], {
      name: "products_category_id_idx",
    });

    await queryInterface.addIndex("products", ["status"], {
      name: "products_status_idx",
    });

    await queryInterface.addIndex("products", ["price"], {
      name: "products_price_idx",
    });

    await queryInterface.addIndex("products", ["rating"], {
      name: "products_rating_idx",
    });

    await queryInterface.addIndex("products", ["created_at"], {
      name: "products_created_at_idx",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("products");
  },
};
