const { Product, Category, OrderItem } = require("../models");
const { ErrorHandler } = require("../utils/utils");
const { extractPublicIdFromUrl } = require("../utils/helper");
const CloudinaryService = require("../utils/CloudinaryService");
const { Op } = require("sequelize");

// Create Product
const createProduct = async (data) => {
  try {
    const { name, description, price, category_id, stock, image } = data;

    if (!name || !price || !category_id) {
      throw new ErrorHandler(
        "Product name, price, and category are required",
        400
      );
    }

    // Verify category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    // Validate data
    const validAttributes = Object.keys(Product.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    const product = await Product.create({
      name,
      description,
      price,
      category_id,
      stock: stock || 0,
      image,
      rating: 0,
      reviews: 0,
      status: stock > 0 ? "active" : "out_of_stock",
    });

    // Reload with category
    const productWithCategory = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description", "image"],
        },
      ],
    });

    return productWithCategory;
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

// Get All Products
const getAllProducts = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category_id,
      min_price,
      max_price,
      status,
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

    // Category filter
    if (category_id) {
      whereClause.category_id = category_id;
    }

    // Price range filter
    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = min_price;
      if (max_price) whereClause.price[Op.lte] = max_price;
    }

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description", "image"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return {
      products: rows,
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

// Get Product by ID
const getProductById = async (productId) => {
  try {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description", "image"],
        },
      ],
    });

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    return product;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Update Product
const updateProduct = async (productId, data) => {
  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    // Validate data
    const validAttributes = Object.keys(Product.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    // Verify category exists if updating category
    if (data.category_id) {
      const category = await Category.findByPk(data.category_id);
      if (!category) {
        throw new ErrorHandler("Category not found", 404);
      }
    }

    // Delete existing image if updating image
    if (data?.image && product?.image && product?.image !== data?.image) {
      const publicKey = await extractPublicIdFromUrl(product?.image);
      const cloudinaryService = new CloudinaryService();
      const deleted = await cloudinaryService.deleteFile(publicKey);
      if (!deleted) {
        throw new ErrorHandler("Failed to delete old image", 400);
      }
    }

    // Auto-update status based on stock
    if (data.stock !== undefined) {
      if (data.stock === 0) {
        data.status = "out_of_stock";
      } else if (product.status === "out_of_stock" && data.stock > 0) {
        data.status = "active";
      }
    }

    const updatedProduct = await product.update(data);

    // Reload with category
    const productWithCategory = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description", "image"],
        },
      ],
    });

    return productWithCategory;
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

// Delete Product
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
        },
      ],
    });

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    // Check if product has order items
    if (product.orderItems && product.orderItems.length > 0) {
      throw new ErrorHandler(
        "Cannot delete product with existing orders. Consider marking as inactive instead.",
        400
      );
    }

    // Delete image from cloudinary if exists
    if (product?.image) {
      const publicKey = await extractPublicIdFromUrl(product?.image);
      const cloudinaryService = new CloudinaryService();
      await cloudinaryService.deleteFile(publicKey);
    }

    await product.destroy();

    return {
      message: "Product deleted successfully",
    };
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Update Stock
const updateStock = async (productId, quantity, operation = "add") => {
  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    let newStock = product.stock;

    if (operation === "add") {
      newStock += quantity;
    } else if (operation === "subtract") {
      newStock -= quantity;
      if (newStock < 0) {
        throw new ErrorHandler("Insufficient stock", 400);
      }
    } else {
      throw new ErrorHandler("Invalid operation", 400);
    }

    // Update status based on stock
    const status = newStock === 0 ? "out_of_stock" : "active";

    await product.update({
      stock: newStock,
      status,
    });

    return product;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
};
