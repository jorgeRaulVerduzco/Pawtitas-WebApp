"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Mascota extends Model {
    static associate(models) {
      Mascota.belongsTo(models.CentroAdopcion, {
        foreignKey: "idCentroAdopcion",
        as: "centro",
      });

      Mascota.hasMany(models.Adopcion, {
        foreignKey: "idMascota",
        as: "adopciones",
      });
    }
  }

  Mascota.init(
    {
      idCentroAdopcion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "centro_adopciones",
          key: "id",
        },
      },
      especie: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      raza: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      edad: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      peso: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imagen: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      tamano: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sexo: {
        type: DataTypes.ENUM("macho", "hembra"),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      documento: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM("disponible", "en_proceso", "adoptado"),
        defaultValue: "disponible",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Mascota",
      tableName: "mascotas",
      timestamps: true,
    }
  );

  return Mascota;
};