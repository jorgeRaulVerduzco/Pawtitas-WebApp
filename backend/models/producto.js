"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.belongsToMany(models.Categoria, {
        through: models.ProductoCategoria,
        foreignKey: "productoId",
        otherKey: "categoriaId",
        as: "categorias",
      });
    }
  }

  Producto.init(
    {
      nombre: { type: DataTypes.STRING, allowNull: false },
      descripcion: { type: DataTypes.TEXT, allowNull: false },
      precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      imagen: { type: DataTypes.TEXT('long'), allowNull: true },
      calificacion: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
      cantidadStock: { type: DataTypes.INTEGER, defaultValue: 0 },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "Producto",
      tableName: "Productos", // 🔥 CORREGIDO (antes: productos)
      timestamps: true,
    }
  );

  return Producto;
};
