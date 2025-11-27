"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Adopcion extends Model {
    static associate(models) {
      // N:1 con Usuario
      Adopcion.belongsTo(models.Usuario, {
        foreignKey: "idUsuario",
        as: "usuario",
      });

      // N:1 con Mascota (una adopción es para UNA mascota)
      Adopcion.belongsTo(models.Mascota, {
        foreignKey: "idMascota",
        as: "mascota",
      });
    }
  }

  Adopcion.init(
    {
      idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      idMascota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mascotas",
          key: "id",
        },
      },
      tipoVivienda: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tienePatio: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      fechaSolicitud: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      fechaResolucion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      razonAdopcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tieneExperiencia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      estadoSolicitud: {
        type: DataTypes.ENUM("pendiente", "aprobada", "rechazada"),
        defaultValue: "pendiente",
        allowNull: false,
      },
      documentosSolicitud: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Adopcion",
      tableName: "adopciones",
      timestamps: true,
    }
  );

  return Adopcion;
};
