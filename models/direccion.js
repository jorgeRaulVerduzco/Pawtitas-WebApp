'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Direccion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Direccion.init({
    usuarioId: DataTypes.INTEGER,
    calle: DataTypes.STRING,
    numeroExterior: DataTypes.STRING,
    numeroInterior: DataTypes.STRING,
    colonia: DataTypes.STRING,
    ciudad: DataTypes.STRING,
    codigoPostal: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Direccion',
  });
  return Direccion;
};