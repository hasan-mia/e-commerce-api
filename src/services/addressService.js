const { Address } = require("../models");
const { ErrorHandler } = require("../utils/utils");

const upsertAddress = async (userId, data) => {
  try {
    if (!userId) throw new ErrorHandler("User ID is required", 400);

    // Validate keys
    const validAttributes = Object.keys(Address.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    // Check if address already exists for the user
    let address = await Address.findOne({ where: { user_id: userId } });

    if (address) {
      // Update existing address
      await address.update(data);
    } else {
      // Create new address
      address = await Address.create({ ...data, user_id: userId });
    }

    return address;
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

// Get All Addresses with Pagination
const getAllAddresses = async (query) => {
  const { page = 1, limit = 10 } = query || {};
  try {
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await Address.findAndCountAll({
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return { data, page, limit, total, totalPages, nextPage };
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// Get Address by ID
const getAddressById = async (id) => {
  try {
    const address = await Address.findOne({ where: { user_id: id } });
    if (!address) throw new ErrorHandler("Address not found", 404);
    return address;
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// Update Address by ID
const updateAddress = async (id, data) => {
  try {
    const address = await Address.findByPk(id);
    if (!address) throw new ErrorHandler("Address not found", 404);

    const validAttributes = Object.keys(Address.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    await address.update(data);
    return address;
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const validationMessages = error.errors.map((e) => e.message).join(", ");
      throw new ErrorHandler(validationMessages, error.statusCode || 400);
    }
    throw new ErrorHandler(error.message, 500);
  }
};

// Delete Address by ID (soft delete)
const deleteAddress = async (id) => {
  try {
    const address = await Address.findByPk(id);
    if (!address) throw new ErrorHandler("Address not found", 404);

    await address.destroy();
    return { message: "Address deleted successfully" };
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

module.exports = {
  upsertAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
