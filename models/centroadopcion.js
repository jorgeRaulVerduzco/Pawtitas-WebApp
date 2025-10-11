"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CentroAdopcion extends Model {
    static associate(models) {
      // 1:N con Mascota
      CentroAdopcion.hasMany(models.Mascota, {
        foreignKey: "idCentroAdopcion",
        as: "mascotas",
      });
    }
  }

  CentroAdopcion.init(
    {
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CentroAdopcion",
      tableName: "centro_adopciones",
      timestamps: true,
    }
  );

  return CentroAdopcion;
};
