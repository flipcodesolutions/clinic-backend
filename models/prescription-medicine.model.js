const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PrescriptionMedicine = sequelize.define(
  "PrescriptionMedicine",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    prescription_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    medicine_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    strength: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    dosage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    frequency: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    duration: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    instruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "prescription_medicines",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = PrescriptionMedicine;
