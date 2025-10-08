"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      // N:M con Categoria (a traves de productoCategorias)
      Producto.belongsToMany(models.Categoria, {
        through: models.ProductoCategoria, 
        foreignKey: "productoId",
        otherKey: "categoriaId",
        as: "categorias",
      });

      // 1:N con VentaItem
      //Producto.hasMany(models.VentaItem, {
      // foreignKey: 'productoId',
      //as: 'ventaItems'
      // });
    }
  }

  Producto.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      imagen: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      calificacion: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
      cantidadStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Producto",
      tableName: "productos",
      timestamps: true,
    }
  );

  return Producto;
};
