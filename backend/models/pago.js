'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pago extends Model {
    static associate(models) {
      // N:1 con Venta
      Pago.belongsTo(models.Venta, {
        foreignKey: 'ventaId',
        as: 'venta'
      });
    }
  }
  
  Pago.init({
    ventaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ventas',
        key: 'id'
      }
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    metodoPago: {
      type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
      allowNull: false
    },
    referencia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fechaPago: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      defaultValue: 'pendiente',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Pago',
    tableName: 'pagos',
    timestamps: true
  });
  
  return Pago;
};