'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CentroAdopcion extends Model {
  
    static associate(models) {
      this.hasMany(models.Mascota, {
        foreignKey: 'idCentroAdopcion',
        as: 'mascotas'
      });
    }
  }
  CentroAdopcion.init({
    correo: DataTypes.STRING,
    nombre: DataTypes.STRING,
    telefono: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CentroAdopcion',
    tableName: 'CentroAdopciones',
  });
  return CentroAdopcion;
};