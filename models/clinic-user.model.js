const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClinicUser = sequelize.define(
  "ClinicUser",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    clinic_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "clinic_users",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = ClinicUser;
