'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {
      // N:1 con Usuario (cliente)
      Venta.belongsTo(models.Usuario, {
        foreignKey: 'clienteId',
        as: 'cliente'
      });
      
      // 1:N con VentaItem
      Venta.hasMany(models.VentaItem, {
        foreignKey: 'ventaId',
        as: 'items'
      });
      
      // 1:N con Pago
      Venta.hasMany(models.Pago, {
        foreignKey: 'ventaId',
        as: 'pagos'
      });
    }
  }
  
  Venta.init({
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    fechaVenta: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'completada', 'cancelada'),
      defaultValue: 'pendiente',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'ventas',
    timestamps: true
  });
  
  return Venta;
};