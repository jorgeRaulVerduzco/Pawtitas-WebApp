"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {
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
      nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
      descripcion: { type: DataTypes.TEXT, allowNull: true },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "Categoria",
      tableName: "Categorias", // 🔥 CORREGIDO (antes: categorias)
      timestamps: true,
    }
  );

  return Categoria;
};
