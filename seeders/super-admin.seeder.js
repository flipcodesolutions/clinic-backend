const { User } = require("../models");
const { hashDefaultPassword, upsertUser } = require("./helpers/user.helper");

async function seedSuperAdmin() {
  const passwordHash = await hashDefaultPassword();

  const superAdmin = await upsertUser({
    first_name: "Super",
    last_name: "Admin",
    email: "superadmin@clinic.local",
    phone: "9999999999",
    roles: ["super_admin"],
    passwordHash,
  });

  console.log(`✓ Super Admin created: ${superAdmin.email}`);
  return superAdmin;
}

module.exports = { seedSuperAdmin };
