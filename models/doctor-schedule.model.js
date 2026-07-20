const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorSchedule = sequelize.define(
  "DoctorSchedule",
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

    clinic_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    day_of_week: {
      type: DataTypes.ENUM(
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
      ),
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    slot_duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 15,
    },

    maximum_booking: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "doctor_schedules",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = DoctorSchedule;
