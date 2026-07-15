const sequelize = require("../config/database");
const User = require("./user.model");
// const Role = require("./role.model");
const db = {
  sequelize,
  User,
  // Role,
};

async function syncDatabase({ alter = false, force = false } = {}) {
  await sequelize.ensureDatabase();
  await sequelize.authenticate();
  await sequelize.sync({ alter, force });
  console.log("Database synced successfully");
}

module.exports = {
  ...db,
  syncDatabase,
};
