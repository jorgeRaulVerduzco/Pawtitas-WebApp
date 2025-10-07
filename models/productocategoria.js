'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductoCategoria extends Model {
    static associate(models) {
   
    }
  }
  
  ProductoCategoria.init({
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'ProductoCategoria',
    tableName: 'producto_categorias',
    timestamps: false, 
    indexes: [
      {
        unique: true,
        fields: ['productoId', 'categoriaId'] // Evita duplicados
      }
    ]
  });
  
  return ProductoCategoria;
};