const express = require("express");
const categoryRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

categoryRouter
  .post("/", isAuthorized("manage_categories"), createCategory)
  .get("/", getAllCategories)
  .get("/:id", getCategoryById)
  .put("/:id", isAuthorized("manage_categories"), updateCategory)
  .delete("/:id", isAuthorized("manage_categories"), deleteCategory);

module.exports = categoryRouter;
