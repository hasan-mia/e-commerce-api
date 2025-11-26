const express = require("express");
const router = express.Router();

const fileRouter = require("./fileRoutes");
const authRouter = require("./authRoutes");
const roleRouter = require("./roleRoutes");
const categoryRouter = require("./categoryRoutes");
// const heroSlideRouter = require("./heroSlideRoutes");

// File Route
router.use("/file", fileRouter);
router.use("/auth", authRouter);
router.use("/roles", roleRouter);

// Other Routes

router.use("/categories", categoryRouter);
// router.use("/hero-slides", heroSlideRouter);

module.exports = router;
