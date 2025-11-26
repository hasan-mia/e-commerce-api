const express = require("express");
const roleRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");

roleRouter
  .post("/", isAuthorized("create_role"), createRole)
  .get("/", isAuthorized("view_role"), getAllRoles)
  .get("/:id", isAuthorized("view_role"), getRoleById)
  .put("/:id", isAuthorized("update_role"), updateRole)
  .delete("/:id", isAuthorized("delete_role"), deleteRole);

module.exports = roleRouter;
