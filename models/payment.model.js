const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define(
  "Payment",
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

    payment_method: {
      type: DataTypes.ENUM("cash", "card", "upi", "net_banking", "other"),
      allowNull: false,
    },

    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending",
    },

    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Payment;
