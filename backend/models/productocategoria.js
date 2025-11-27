"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductoCategoria extends Model {
    static associate(models) {}
  }

  ProductoCategoria.init(
    {
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Productos", key: "id" }, // 🔥 CORREGIDO
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Categorias", key: "id" }, // 🔥 CORREGIDO
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "ProductoCategoria",
      tableName: "ProductoCategorias", // 🔥 CORREGIDO (antes productoCategorias)
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["productoId", "categoriaId"],
        },
      ],
    }
  );

  return ProductoCategoria;
};
