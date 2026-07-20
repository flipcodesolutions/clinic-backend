const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorProfile = sequelize.define(
  "DoctorProfile",
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

    registration_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    specialization: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    experience_years: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },

    consultation_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    languages: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },

    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "doctor_profiles",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = DoctorProfile;
