const express = require("express");
const roleRouter = express.Router();
const { isAuthorized, isAuthenticated } = require("../middleware/auth");
const {
  upsertAddress,
  getAddressById,
} = require("../controllers/addressController");

roleRouter
  .post("/", isAuthenticated, upsertAddress)
  .get("/", isAuthenticated, getAddressById);

module.exports = roleRouter;
