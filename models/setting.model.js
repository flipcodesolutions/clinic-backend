const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "settings",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Setting;
