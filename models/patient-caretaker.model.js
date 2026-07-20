const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatientCareTaker = sequelize.define(
  "PatientCareTaker",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    patient_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    caretaker_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    relationship: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "patient_caretakers",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = PatientCareTaker;
