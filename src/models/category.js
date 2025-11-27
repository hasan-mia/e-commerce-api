"use strict";

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Category name cannot be empty",
          },
          len: {
            args: [2, 100],
            msg: "Category name must be between 2 and 100 characters",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "categories",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      foreignKey: "category_id",
      as: "products",
    });
  };

  return Category;
};
