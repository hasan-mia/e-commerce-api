const express = require("express");
const heroRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  createHero,
  getAllHeroes,
  getActiveHeroes,
  getHeroById,
  updateHero,
  updateHeroOrder,
  reorderHeroes,
  deleteHero,
  toggleHeroStatus,
} = require("../controllers/heroController");

heroRouter
  .post("/", isAuthorized("manage_heroes"), createHero)
  .get("/", isAuthorized("manage_heroes"), getAllHeroes)
  .get("/active", getActiveHeroes) // Public route for frontend
  .get("/:id", getHeroById)
  .put("/:id", isAuthorized("manage_heroes"), updateHero)
  .patch("/:id/order", isAuthorized("manage_heroes"), updateHeroOrder)
  .post("/reorder", isAuthorized("manage_heroes"), reorderHeroes)
  .patch("/:id/toggle-status", isAuthorized("manage_heroes"), toggleHeroStatus)
  .delete("/:id", isAuthorized("manage_heroes"), deleteHero);

module.exports = heroRouter;
