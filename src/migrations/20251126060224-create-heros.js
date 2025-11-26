"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("heroes", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      subtitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      bg_color: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: "from-slate-900 to-slate-700",
        comment: "Tailwind gradient classes",
      },
      cta: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: "Shop Now",
        comment: "Call to action button text",
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      price: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Display price (e.g., '$1,999' or 'From $299')",
      },
      badge: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Badge text (e.g., 'New Arrival', 'Best Seller')",
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Display order (lower numbers appear first)",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
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

    // Add indexes
    await queryInterface.addIndex("heroes", ["order", "status"], {
      name: "heroes_order_status_idx",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("heroes");
  },
};
