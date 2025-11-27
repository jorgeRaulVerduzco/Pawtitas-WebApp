'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VentaItem extends Model {
    static associate(models) {
      // N:1 con Venta
      VentaItem.belongsTo(models.Venta, {
        foreignKey: 'ventaId',
        as: 'venta'
      });
      
      // N:1 con Producto
      VentaItem.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
    }
  }
  
  VentaItem.init({
    ventaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ventas',
        key: 'id'
      }
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'VentaItem',
    tableName: 'VentaItems',
    timestamps: true
  });
  
  return VentaItem;
};