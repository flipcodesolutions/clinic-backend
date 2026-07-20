const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorDepartment = sequelize.define(
  "DoctorDepartment",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    doctor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "doctor_departments",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = DoctorDepartment;
