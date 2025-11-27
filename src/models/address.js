"use strict";

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "Address",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      zip: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
      },
    },
    {
      tableName: "addresses", // corrected table name
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Address.associate = (models) => {
    Address.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Address;
};
