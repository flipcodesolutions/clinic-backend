const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vital = sequelize.define(
  "Vital",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    appointment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    temperature: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
    },

    pulse: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    bp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },

    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },

    oxygen: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
  },
  {
    tableName: "vitals",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Vital;
