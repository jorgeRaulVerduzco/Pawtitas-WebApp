'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Mascota extends Model {
    static associate(models) {
      // 1:N con Adopcion
      Mascota.belongsTo(models.Adopcion, {
        foreignKey: 'idAdopcion',
        as: 'adopcion'
      });

      // 1:N con CentroAdopcion
      Mascota.belongsTo(models.CentroAdopcion, {
        foreignKey: 'idCentroAdopcion',
        as: 'centro'
      });
    }
  }

  Mascota.init({
    idAdopcion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idCentroAdopcion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    especie: DataTypes.STRING,
    nombre: DataTypes.STRING,
    edad: DataTypes.STRING,
    imagen: DataTypes.STRING,
    tamano: DataTypes.STRING,
    sexo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    documento: DataTypes.STRING,
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'disponible'
    }
  }, {
    sequelize,
    modelName: 'Mascota',
    tableName: 'Mascotas',
  });

  return Mascota;
};
