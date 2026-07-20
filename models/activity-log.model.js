const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    record_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },

    device: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "activity_logs",
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    underscored: true,
  }
);

module.exports = ActivityLog;
