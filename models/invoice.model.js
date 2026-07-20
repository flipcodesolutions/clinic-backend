const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Invoice = sequelize.define(
  "Invoice",
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

    invoice_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM("pending", "paid", "partial", "cancelled"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "invoices",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Invoice;
