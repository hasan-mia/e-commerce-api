const express = require("express");
const router = express.Router();

const fileRouter = require("./fileRoutes");
const authRouter = require("./authRoutes");
const roleRouter = require("./roleRoutes");
const heroRouter = require("./heroRoutes");
const categoryRouter = require("./categoryRoutes");
const productRouter = require("./productRoutes");
const orderRouter = require("./orderRoutes");
const transactionRouter = require("./transactionRoutes");

// File Route
router.use("/file", fileRouter);
router.use("/auth", authRouter);
router.use("/roles", roleRouter);

// Other Routes
router.use("/heroes", heroRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/orders", orderRouter);
router.use("/transactions", transactionRouter);

module.exports = router;
