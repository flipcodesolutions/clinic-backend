const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClinicDepartment = sequelize.define(
  "ClinicDepartment",
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

    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "clinic_departments",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = ClinicDepartment;
