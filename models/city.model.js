const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const City = sequelize.define(
  "City",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "cities",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = City;
