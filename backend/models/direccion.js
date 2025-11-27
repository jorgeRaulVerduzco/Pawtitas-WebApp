"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Direccion extends Model {
    static associate(models) {
      Direccion.belongsTo(models.Usuario, {
        foreignKey: "usuarioId",
        as: "usuario",
      });
    }
  }

  Direccion.init(
    {
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      calle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numeroExterior: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numeroInterior: DataTypes.STRING,
      colonia: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ciudad: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      codigoPostal: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Direccion",
      tableName: "Direccions",
      timestamps: true,
    }
  );

  return Direccion;
};