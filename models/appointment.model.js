const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    appointment_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    clinic_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    doctor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    patient_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    visit_type: {
      type: DataTypes.ENUM("new", "follow_up"),
      defaultValue: "new",
    },

    consultation_type: {
      type: DataTypes.ENUM("in_person", "online"),
      defaultValue: "in_person",
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    booked_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
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
      defaultValue: "scheduled",
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "appointments",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Appointment;
