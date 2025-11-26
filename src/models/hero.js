"use strict";

module.exports = (sequelize, DataTypes) => {
  const Hero = sequelize.define(
    "Hero",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title cannot be empty",
          },
          len: {
            args: [2, 200],
            msg: "Title must be between 2 and 200 characters",
          },
        },
      },
      subtitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Image is required",
          },
        },
      },
      bg_color: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "from-slate-900 to-slate-700",
        comment: "Tailwind gradient classes",
      },
      cta: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "Shop Now",
        comment: "Call to action button text",
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "products",
          key: "id",
        },
      },
      price: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Display price (e.g., '$1,999' or 'From $299')",
      },
      badge: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Badge text (e.g., 'New Arrival', 'Best Seller')",
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Order must be a positive number",
          },
        },
        comment: "Display order (lower numbers appear first)",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
    },
    {
      tableName: "heroes",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["order", "status"],
        },
      ],
    }
  );

  Hero.associate = (models) => {
    Hero.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
    Hero.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "category",
    });
  };

  return Hero;
};
