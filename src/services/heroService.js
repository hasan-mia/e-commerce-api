const { Hero, Product, Category } = require("../models");
const { ErrorHandler } = require("../utils/utils");
const { extractPublicIdFromUrl } = require("../utils/helper");
const CloudinaryService = require("../utils/CloudinaryService");
const { Op } = require("sequelize");

// Create Hero Slide
const createHero = async (data) => {
  try {
    const { title, image, product_id, category_id } = data;

    if (!title || !image) {
      throw new ErrorHandler("Title and image are required", 400);
    }

    // Verify product exists if provided
    if (product_id) {
      const product = await Product.findByPk(product_id);
      if (!product) {
        throw new ErrorHandler("Product not found", 404);
      }
    }

    // Verify category exists if provided
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        throw new ErrorHandler("Category not found", 404);
      }
    }

    // Validate data
    const validAttributes = Object.keys(Hero.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    // Get the highest order number and add 1
    const lastHero = await Hero.findOne({
      order: [["order", "DESC"]],
    });

    const hero = await Hero.create({
      ...data,
      order: data.order !== undefined ? data.order : (lastHero?.order || 0) + 1,
      status: data.status || "active",
    });

    // Reload with associations
    const heroWithAssociations = await Hero.findByPk(hero.id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    return heroWithAssociations;
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

// Get All Hero Slides
const getAllHeroes = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "order",
      sortOrder = "ASC",
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Hero.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image", "stock", "status"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return {
      heroes: rows,
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

// Get Active Hero Slides (For Frontend)
const getActiveHeroes = async () => {
  try {
    const heroes = await Hero.findAll({
      where: { status: "active" },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image", "stock", "status"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description"],
        },
      ],
      order: [["order", "ASC"]],
    });

    return heroes;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Get Hero by ID
const getHeroById = async (heroId) => {
  try {
    const hero = await Hero.findByPk(heroId, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image", "description"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!hero) {
      throw new ErrorHandler("Hero slide not found", 404);
    }

    return hero;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Update Hero
const updateHero = async (heroId, data) => {
  try {
    const hero = await Hero.findByPk(heroId);

    if (!hero) {
      throw new ErrorHandler("Hero slide not found", 404);
    }

    // Validate data
    const validAttributes = Object.keys(Hero.rawAttributes);
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new ErrorHandler(
        `${invalidKeys.join(", ")} is not a valid field`,
        400
      );
    }

    // Verify product exists if updating product
    if (data.product_id) {
      const product = await Product.findByPk(data.product_id);
      if (!product) {
        throw new ErrorHandler("Product not found", 404);
      }
    }

    // Verify category exists if updating category
    if (data.category_id) {
      const category = await Category.findByPk(data.category_id);
      if (!category) {
        throw new ErrorHandler("Category not found", 404);
      }
    }

    // Delete existing image if updating image
    if (data?.image && hero?.image && hero?.image !== data?.image) {
      const publicKey = await extractPublicIdFromUrl(hero?.image);
      const cloudinaryService = new CloudinaryService();
      const deleted = await cloudinaryService.deleteFile(publicKey);
      if (!deleted) {
        throw new ErrorHandler("Failed to delete old image", 400);
      }
    }

    await hero.update(data);

    // Reload with associations
    const updatedHero = await Hero.findByPk(heroId, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    return updatedHero;
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

// Update Hero Order
const updateHeroOrder = async (heroId, newOrder) => {
  try {
    const hero = await Hero.findByPk(heroId);

    if (!hero) {
      throw new ErrorHandler("Hero slide not found", 404);
    }

    if (typeof newOrder !== "number" || newOrder < 0) {
      throw new ErrorHandler("Invalid order value", 400);
    }

    await hero.update({ order: newOrder });

    return hero;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Reorder Heroes
const reorderHeroes = async (orderArray) => {
  try {
    // orderArray should be like: [{ id: "hero1", order: 1 }, { id: "hero2", order: 2 }]
    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new ErrorHandler("Invalid order array", 400);
    }

    const updates = [];

    for (const item of orderArray) {
      const hero = await Hero.findByPk(item.id);
      if (!hero) {
        throw new ErrorHandler(`Hero with ID ${item.id} not found`, 404);
      }
      updates.push(hero.update({ order: item.order }));
    }

    await Promise.all(updates);

    // Return updated heroes
    const heroes = await Hero.findAll({
      where: {
        id: orderArray.map((item) => item.id),
      },
      order: [["order", "ASC"]],
    });

    return heroes;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Delete Hero
const deleteHero = async (heroId) => {
  try {
    const hero = await Hero.findByPk(heroId);

    if (!hero) {
      throw new ErrorHandler("Hero slide not found", 404);
    }

    // Delete image from cloudinary if exists
    if (hero?.image) {
      const publicKey = await extractPublicIdFromUrl(hero?.image);
      const cloudinaryService = new CloudinaryService();
      await cloudinaryService.deleteFile(publicKey);
    }

    await hero.destroy();

    return {
      message: "Hero slide deleted successfully",
    };
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

// Toggle Hero Status
const toggleHeroStatus = async (heroId) => {
  try {
    const hero = await Hero.findByPk(heroId);

    if (!hero) {
      throw new ErrorHandler("Hero slide not found", 404);
    }

    const newStatus = hero.status === "active" ? "inactive" : "active";
    await hero.update({ status: newStatus });

    return hero;
  } catch (error) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

module.exports = {
  createHero,
  getAllHeroes,
  getActiveHeroes,
  getHeroById,
  updateHero,
  updateHeroOrder,
  reorderHeroes,
  deleteHero,
  toggleHeroStatus,
};
