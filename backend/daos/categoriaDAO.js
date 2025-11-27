const db = require("../models");
const { Categoria, Producto } = db;

class CategoriaDAO {
  async crearCategoria(data) {
    return await Categoria.create(data);
  }

  async obtenerCategorias({ includeProductos = false } = {}) {
    const include = includeProductos
      ? [{ model: Producto, as: "productos" }]
      : [];

    return await Categoria.findAll({
      include,
      order: [["nombre", "ASC"]],
    });
  }

  async actualizarCategoria(id, cambios) {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return null;
    }

    return await categoria.update(cambios);
  }

  async eliminarCategoria(id) {
    return await Categoria.destroy({ where: { id } });
  }
}

module.exports = new CategoriaDAO();

