const bcrypt = require("bcryptjs");
const { Role, User } = require("../models");
const { v4: uuidv4 } = require("uuid");

const generateAdmin = async () => {
  // Define roles
  const roles = [
    {
      id: uuidv4(),
      name: "ADMIN",
      score: 999,
      description: "Super administrator with full access",
      is_active: true,
    },
    {
      id: uuidv4(),
      name: "USER",
      score: 0,
      description: "Regular user with basic access",
      is_active: true,
    },
  ];

  // Create or find roles
  const createdRoles = {};
  for (const roleData of roles) {
    let role = await Role.findOne({ where: { name: roleData.name } });
    // Debug: Check if models are loaded

    if (!Role) {
      throw new Error("Role model is not loaded!");
    }
    if (!User) {
      throw new Error("User model is not loaded!");
    }

    if (!role) {
      role = await Role.create(roleData);
      console.log(`Created role: ${roleData.name}`);
    }
    createdRoles[roleData.name] = role;
  }

  // User details with role assignments
  const users = [
    {
      email: "admin@gmail.com",
      name: "Admin",
      password: "admin@123",
      roleName: "ADMIN",
    },
    {
      email: "user@gmail.com",
      name: "User",
      password: "user@123",
      roleName: "USER",
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    // Check if user already exists
    let user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      user = await User.create({
        id: uuidv4(),
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role_id: createdRoles[userData.roleName].id,
        status: "active",
      });

      console.log(
        `Created user: ${userData.email} (${userData.roleName}) with password: ${userData.password}`
      );
    }

    createdUsers.push(user);
  }

  return {
    roles: createdRoles,
    users: createdUsers,
    adminUser: createdUsers.find((u) => u.email === "admin@gmail.com"),
    demoUser: createdUsers.find((u) => u.email === "user@gmail.com"),
  };
};

module.exports = generateAdmin;
