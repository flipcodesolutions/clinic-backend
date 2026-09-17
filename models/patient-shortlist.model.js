const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatientShortlist = sequelize.define(
  "PatientShortlist",
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

    doctor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "patient_shortlists",
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["patient_id", "doctor_id"],
      },
    ],
  }
);

module.exports = PatientShortlist;
