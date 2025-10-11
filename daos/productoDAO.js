const db = require("../models");
const { Op, fn, col, where } = require("sequelize"); // 👈 agregamos fn, col, where
const { Producto, Categoria } = db;

class ProductoDAO {
  // Crear producto con categorias
  static async crearProducto(data) {
    try {
      const categorias = data.categorias;
      delete data.categorias;

      const producto = await Producto.create(data);

      if (categorias && Array.isArray(categorias) && categorias.length) {
        const catIds = categorias.filter((c) => typeof c === "number");
        if (catIds.length) {
          await producto.setCategorias(catIds);
        } else {
          const cats = [];
          for (const nombre of categorias) {
            const [cat] = await Categoria.findOrCreate({ where: { nombre } });
            cats.push(cat);
          }
          await producto.setCategorias(cats);
        }
      }

      return producto;
    } catch (err) {
      throw err;
    }
  }

  // 🔹 Obtener producto por id (con o sin categorias)
  static async obtenerProductoPorId(id, { includeCategorias = false } = {}) {
    try {
      const include = includeCategorias
        ? [{ model: Categoria, as: "categorias" }]
        : [];
      return await Producto.findByPk(id, { include });
    } catch (err) {
      throw err;
    }
  }

  // Listar productos 
  static async obtenerProductos({ limit, offset } = {}) {
    try {
      return await Producto.findAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });
    } catch (err) {
      throw err;
    }
  }
  static async actualizarProducto(id, data) {
    try {
      const categorias = Array.isArray(data.categorias) ? data.categorias : [];
      delete data.categorias;

      const [updated] = await Producto.update(data, { where: { id } });
      if (!updated) throw new Error("Producto no encontrado");

      const producto = await Producto.findByPk(id);

      if (categorias.length) {
        const catInstances = [];

        for (const c of categorias) {
          if (typeof c === "number") {
            // Buscar la categoria existente por id
            const cat = await Categoria.findByPk(c);
            if (cat) catInstances.push(cat);
          } else if (typeof c === "string") {
            // Buscar o crear por nombre
            const [cat] = await Categoria.findOrCreate({
              where: { nombre: c },
            });
            if (cat) catInstances.push(cat);
          }
        }

        // Solo si hay categorias validas, hacemos setCategorias
        if (catInstances.length) {
          await producto.setCategorias(catInstances);
        }
      }

      return producto;
    } catch (err) {
      throw err;
    }
  }

  // Eliminar producto
  static async eliminarProducto(id) {
    try {
      const deleted = await Producto.destroy({ where: { id } });
      return !!deleted;
    } catch (err) {
      throw err;
    }
  }

  // Buscar por nombre (corrigiendo el error de sequelize undefined)
  static async buscarPorNombre(nombre) {
    try {
      return await Producto.findAll({
        where: where(fn("LOWER", col("nombre")), {
          [Op.like]: `%${nombre.toLowerCase()}%`,
        }),
      });
    } catch (err) {
      throw err;
    }
  }

  // Filtrar productos por categoría
  static async filtrarPorCategoria(idCategoria) {
    try {
      const cat = await Categoria.findByPk(idCategoria);
      if (!cat) return [];
      return await cat.getProductos();
    } catch (err) {
      throw err;
    }
  }

  // Calificar producto
  static async calificar(idProducto, nuevaCalificacion) {
    await Producto.update(
      { calificacion: nuevaCalificacion },
      { where: { id: idProducto } }
    );
    return await Producto.findByPk(idProducto);
  }

  // Obtener las categorías de un producto
  static async obtenerCategoriasProducto(productoId) {
    const producto = await Producto.findByPk(productoId);
    if (!producto) throw new Error("Producto no encontrado");
    return await producto.getCategorias();
  }
}
module.exports = ProductoDAO;
