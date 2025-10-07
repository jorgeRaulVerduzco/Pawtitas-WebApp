'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // 1:N con Direccion
      Usuario.hasMany(models.Direccion, {
        foreignKey: 'usuarioId',
        as: 'direcciones'
      });
      
      // 1:N con Venta (como cliente)
      Usuario.hasMany(models.Venta, {
        foreignKey: 'clienteId',
        as: 'ventas'
      });
    }
  }
  
  Usuario.init({
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    apellidoPaterno: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    apellidoMaterno: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nombreUsuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    contrasena: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    rol: {
      type: DataTypes.ENUM('cliente', 'empleado', 'administrador'),
      defaultValue: 'cliente',
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    underscored: false
  });
  
  return Usuario;
};