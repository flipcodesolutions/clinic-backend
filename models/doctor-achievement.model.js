const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorAchievement = sequelize.define(
  "DoctorAchievement",
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

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    year: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: "doctor_achievements",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = DoctorAchievement;
