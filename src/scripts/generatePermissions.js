const permissions = [
  // ============================================
  // SYSTEM PERMISSIONS
  // ============================================
  { module: "permission", action: "view_permission", required_score: 10 },
  { module: "permission", action: "create_permission", required_score: 30 },
  { module: "permission", action: "update_permission", required_score: 30 },
  { module: "permission", action: "delete_permission", required_score: 50 },
  { module: "role", action: "view_role", required_score: 10 },
  { module: "role", action: "create_role", required_score: 30 },
  { module: "role", action: "update_role", required_score: 30 },
  { module: "role", action: "delete_role", required_score: 50 },
  { module: "admin", action: "view_admin", required_score: 10 },
  { module: "admin", action: "create_admin", required_score: 30 },
  { module: "admin", action: "update_admin", required_score: 30 },
  { module: "admin", action: "delete_admin", required_score: 50 },

  // ============================================
  // OTHERS PERMISSIONS
  // ============================================
  { module: "categories", action: "manage_categories", required_score: 50 },
  { module: "heroes", action: "manage_heroes", required_score: 50 },
  { module: "orders", action: "manage_orders", required_score: 50 },
  { module: "products", action: "manage_products", required_score: 50 },
  { module: "transactions", action: "manage_transactions", required_score: 50 },
];

module.exports = permissions;
