const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClinicGallery = sequelize.define(
  "ClinicGallery",
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

    title: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    photo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    uploaded_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: "clinic_galleries",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = ClinicGallery;
