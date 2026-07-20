const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StaffProfile = sequelize.define(
  "StaffProfile",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },

    designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    employee_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },

    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    shift: {
      type: DataTypes.ENUM("morning", "evening", "night"),
      allowNull: true,
    },

    experience_years: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "staff_profiles",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = StaffProfile;
