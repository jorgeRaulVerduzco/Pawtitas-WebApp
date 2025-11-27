"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {
      // N:M con Producto (a traves de ProductoCategoria)
      Categoria.belongsToMany(models.Producto, {
        through: models.ProductoCategoria,
        foreignKey: "categoriaId",
        otherKey: "productoId",
        as: "productos",
      });
    }
  }

  Categoria.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Categoria",
      tableName: "categorias",
      timestamps: true,
    }
  );

  return Categoria;
};
