const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InvoiceItem = sequelize.define(
  "InvoiceItem",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    invoice_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    qty: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "invoice_items",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = InvoiceItem;
