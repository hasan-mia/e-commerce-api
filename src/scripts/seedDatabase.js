const { Permission } = require("../models");
const generateAdmin = require("./generateAdmin");

const permissions = require("./generatePermissions");
const generateSeeds = require("./generateSeeds");

const seedDatabase = async () => {
  try {
    const now = Date.now();

    // Seed Super Admin
    (async () => {
      try {
        await generateAdmin();
      } catch (error) {
        console.error("Error generating Super Admin:", error);
      }
    })();

    // Seed Permissions
    (async () => {
      for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];

        const existingPermission = await Permission.findOne({
          where: { action: permission.action },
          paranoid: false,
        });

        if (!existingPermission) {
          console.log(`Seeding permission: ${JSON.stringify(permission)}`);
          try {
            await Permission.create({
              ...permission,
              createdAt: new Date(now - i * 1000 * 60),
              updatedAt: new Date(now - i * 1000 * 60),
            });
          } catch (error) {
            console.error(
              `Error creating permission '${permission.action}':`,
              error
            );
          }
        } else if (existingPermission.deletedAt) {
          try {
            console.log(
              `Restorign permission: ${JSON.stringify(
                existingPermission?.action
              )}`
            );
            await existingPermission.restore();
            await existingPermission.update({
              ...permission,
              updatedAt: new Date(),
            });
          } catch (error) {
            console.error(
              `Error restoring permission '${permission.action}':`,
              error
            );
          }
        }
      }
    })();

    // Seed other data
    (async () => {
      try {
        await generateSeeds();
      } catch (error) {
        console.error("Error generating seed data:", error);
      }
    })();
    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

module.exports = seedDatabase;
