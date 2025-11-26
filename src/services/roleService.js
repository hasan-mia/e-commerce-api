const { Role } = require("../models");
const { ErrorHandler } = require("../utils/utils");

// Create Role
const createRole = async (data) => {
  const { name } = data;
  try {
    const validAttributes = Object.keys(Role.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    const exists = await Role.findOne({ where: { name } });
    if (exists) throw new ErrorHandler("Name already exists", 409);

    return await Role.create(data);
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const validationMessages = error.errors.map((e) => e.message).join(", ");
      throw new ErrorHandler(validationMessages, error.statusCode || 400);
    }
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Get All Roles
const getAllRoles = async (query) => {
  const { page = 1, limit = 10 } = query || {};
  try {
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await Role.findAndCountAll({
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      data,
      page,
      limit,
      total,
      totalPages,
      nextPage,
    };
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw new ErrorHandler(error.message, error.statusCode || 400);
    }
    throw new ErrorHandler(error.message, 500);
  }
};

// Get Single Role by ID
const getRoleById = async (id) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) throw new ErrorHandler("Role not found", 404);
    return role;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw new ErrorHandler(error.message, error.statusCode || 400);
    }
    throw new ErrorHandler(error.message, 500);
  }
};

// Update Role by ID (partial update)
const updateRole = async (id, data) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) throw new ErrorHandler("Role not found", 404);

    const validAttributes = Object.keys(Role.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    // Check for unique name
    if (data.name && data.name !== role.name) {
      const exists = await Role.findOne({ where: { name: data.name } });
      if (exists) throw new ErrorHandler("Name already exists", 400);
    }

    await role.update(data);
    return role;
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const validationMessages = error.errors.map((e) => e.message).join(", ");
      throw new ErrorHandler(validationMessages, error.statusCode || 400);
    }
    throw new ErrorHandler(
      error.message || "Failed to create company",
      error.statusCode || 500
    );
  }
};

// Delete Role by ID (soft delete)
const deleteRole = async (id) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) throw new ErrorHandler("Role not found", 404);

    await role.destroy();
    return { message: "Role deleted successfully" };
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw new ErrorHandler(error.message, error.statusCode || 400);
    }
    throw new ErrorHandler(error.message, 500);
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
