const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    descripton:{
      type: DataTypes.STRING(100),
      allowNull: false,
    }
    
   
  },
  {
    tableName: "roles",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

module.exports = Role;