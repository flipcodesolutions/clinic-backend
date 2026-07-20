const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CareTakerProfile = sequelize.define(
  "CareTakerProfile",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },

    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "caretaker_profiles",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = CareTakerProfile;
