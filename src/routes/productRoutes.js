const express = require("express");
const productRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getBestSellers,
  getNewArrivals,
} = require("../controllers/productController");

productRouter
  .post("/", isAuthorized("manage_products"), createProduct)
  .get("/", getAllProducts)
  .get("/best-sellers", getBestSellers)
  .get("/new-arrivals", getNewArrivals)
  .get("/:id", getProductById)
  .put("/:id", isAuthorized("manage_products"), updateProduct)
  .delete("/:id", isAuthorized("manage_products"), deleteProduct)
  .patch("/:id/stock", isAuthorized("manage_products"), updateStock);

module.exports = productRouter;
