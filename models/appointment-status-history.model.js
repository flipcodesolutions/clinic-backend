const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AppointmentStatusHistory = sequelize.define(
  "AppointmentStatusHistory",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    appointment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "confirmed",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show"
      ),
      allowNull: false,
    },

    changed_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "appointment_status_histories",
    timestamps: true,
    updatedAt: false,
    paranoid: true,
    underscored: true,
  }
);

module.exports = AppointmentStatusHistory;
