'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Adopcion extends Model {
    static associate(models) {
      // 🔹 1:N con usuario
      Adopcion.belongsTo(models.Usuario, {
        foreignKey: 'idUsuario',
        as: 'usuario'
      });

      // 1:N con mascota
      Adopcion.hasMany(models.Mascota, {
        foreignKey: 'idAdopcion',
        as: 'mascotas'
      });
    }
  }

  Adopcion.init({
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fechaSolicitud: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechaResolucion: DataTypes.DATE,
    razonAdopcion: DataTypes.TEXT,
    documentosSolicitud: DataTypes.STRING,
    tieneExperiencia: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    estadoSolicitud: {
      type: DataTypes.STRING,
      defaultValue: 'pendiente'
    },
    tipoVivienda: DataTypes.STRING,
    tienePatio: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Adopcion',
    tableName: 'Adopciones', 
  });

  return Adopcion;
};
