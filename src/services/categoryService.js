const { Category, Product } = require("../models");
const { ErrorHandler } = require("../utils/utils");
const { extractPublicIdFromUrl } = require("../utils/helper");
const CloudinaryService = require("../utils/CloudinaryService");
const { Op } = require("sequelize");

// Create Category
const createCategory = async (data) => {
  try {
    const { name, description, image } = data;

    if (!name) {
      throw new ErrorHandler("Category name is required", 400);
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      throw new ErrorHandler("Category already exists", 400);
    }

    // Validate data
    const validAttributes = Object.keys(Category.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    const category = await Category.create({
      name,
      description,
      image,
    });

    return category;
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

// Get All Categories
const getAllCategories = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Category.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["createdAt", "updatedAt"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return {
      categories: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Get Category by ID
const getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: Product,
          as: "products",
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "image",
            "stock",
            "rating",
            "reviews",
            "status",
          ],
        },
      ],
    });

    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    return category;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Update Category
const updateCategory = async (categoryId, data) => {
  try {
    const category = await Category.findByPk(categoryId);

    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    // Validate data
    const validAttributes = Object.keys(Category.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    // Check if name already exists (if updating name)
    if (data.name && data.name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name: data.name },
      });
      if (existingCategory) {
        throw new ErrorHandler("Category name already exists", 400);
      }
    }

    // Delete existing image if updating image
    if (data?.image && category?.image && category?.image !== data?.image) {
      const publicKey = await extractPublicIdFromUrl(category?.image);
      const cloudinaryService = new CloudinaryService();
      const deleted = await cloudinaryService.deleteFile(publicKey);
      if (!deleted) {
        throw new ErrorHandler("Failed to delete old image", 400);
      }
    }

    const updatedCategory = await category.update(data);

    return updatedCategory;
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

// Delete Category
const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: Product,
          as: "products",
        },
      ],
    });

    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      throw new ErrorHandler(
        "Cannot delete category with associated products",
        400
      );
    }

    // Delete image from cloudinary if exists
    if (category?.image) {
      const publicKey = await extractPublicIdFromUrl(category?.image);
      const cloudinaryService = new CloudinaryService();
      await cloudinaryService.deleteFile(publicKey);
    }

    await category.destroy();

    return {
      message: "Category deleted successfully",
    };
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
