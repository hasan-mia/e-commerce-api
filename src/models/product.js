"use strict";

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Product name cannot be empty",
          },
          len: {
            args: [2, 200],
            msg: "Product name must be between 2 and 200 characters",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Price must be greater than or equal to 0",
          },
        },
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
        validate: {
          isValidArray(value) {
            if (value && !Array.isArray(value)) {
              throw new Error("Image must be an array of strings");
            }
            if (value && value.length > 10) {
              throw new Error("Maximum 10 images allowed");
            }
          },
        },
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Stock cannot be negative",
          },
        },
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: "Rating must be between 0 and 5",
          },
          max: {
            args: [5],
            msg: "Rating must be between 0 and 5",
          },
        },
      },
      reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Reviews count cannot be negative",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "out_of_stock"),
        defaultValue: "active",
        allowNull: false,
      },
    },
    {
      tableName: "products",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeSave: (product) => {
          // Automatically set status to out_of_stock if stock is 0
          if (product.stock === 0 && product.status === "active") {
            product.status = "out_of_stock";
          }
        },
      },
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "category",
    });
    Product.hasMany(models.OrderItem, {
      foreignKey: "product_id",
      as: "orderItems",
    });
  };

  return Product;
};
