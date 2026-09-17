const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatientFamilyMember = sequelize.define(
  "PatientFamilyMember",
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

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    relation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Other",
    },

    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
      defaultValue: "other",
    },

    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    blood_group: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "B+",
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    tableName: "patient_family_members",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = PatientFamilyMember;
