const express = require("express");
const categoryRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require("../controllers/categoryController");

categoryRouter
  .post("/", isAuthorized("manage_categories"), createCategory)
  .get("/", getAllCategories)
  .put("/:categoryId", isAuthorized("manage_categories"), updateCategory)
  .delete("/:categoryId", isAuthorized("manage_categories"), deleteCategory);

module.exports = categoryRouter;
