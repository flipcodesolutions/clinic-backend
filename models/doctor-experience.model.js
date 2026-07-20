const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorExperience = sequelize.define(
  "DoctorExperience",
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

    hospital_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "doctor_experiences",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = DoctorExperience;
