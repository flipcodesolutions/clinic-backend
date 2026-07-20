const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatientDocument = sequelize.define(
  "PatientDocument",
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

    document_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    uploaded_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: "patient_documents",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = PatientDocument;
