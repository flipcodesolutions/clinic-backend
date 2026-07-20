const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorLeave = sequelize.define(
  "DoctorLeave",
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

    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "doctor_leaves",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = DoctorLeave;
