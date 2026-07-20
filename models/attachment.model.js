const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attachment = sequelize.define(
  "Attachment",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    module_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    file_name: {
      type: DataTypes.STRING(255),
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
    tableName: "attachments",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Attachment;
