const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatientProfile = sequelize.define(
  "PatientProfile",
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

    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },

    blood_group: {
      type: DataTypes.ENUM(
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ),
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

    marital_status: {
      type: DataTypes.ENUM("single", "married", "divorced", "widowed"),
      allowNull: true,
    },

    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    emergency_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    emergency_contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    tableName: "patient_profiles",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = PatientProfile;
