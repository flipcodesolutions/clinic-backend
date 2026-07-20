const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClinicService = sequelize.define(
  "ClinicService",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    clinic_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "clinic_services",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = ClinicService;
