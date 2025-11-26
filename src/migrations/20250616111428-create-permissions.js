"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("permissions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      module: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "customers, agents, packages, etc.",
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "create, read, update, delete",
      },
      resource: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "specific resource/endpoint",
      },
      required_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "minimum score needed",
      },
      description: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.STRING(15),
        defaultValue: "active",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Soft delete",
      },
    });

    await queryInterface.addIndex("permissions", {
      fields: ["module", "action", "resource"],
      unique: true,
      name: "unique_permission",
    });

    await queryInterface.addIndex("permissions", ["required_score"]);
    await queryInterface.addIndex("permissions", ["module"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("permissions");
  },
};
