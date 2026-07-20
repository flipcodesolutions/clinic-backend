const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Prescription = sequelize.define(
  "Prescription",
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

    doctor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    patient_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    instruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "prescriptions",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Prescription;
