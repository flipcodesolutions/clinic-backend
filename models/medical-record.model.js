const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MedicalRecord = sequelize.define(
  "MedicalRecord",
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

    chief_complaint: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    history: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    follow_up_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "medical_records",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = MedicalRecord;
