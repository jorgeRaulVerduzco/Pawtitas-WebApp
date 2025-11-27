const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
const { Producto, Categoria } = db;

class ProductoDAO {
  constructor() {}

  // Crear producto con categorias
  async crearProducto(data) {
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

  // Obtener producto por id (con o sin categorias)
  async obtenerProductoPorId(id, { includeCategorias = false } = {}) {
    try {
      const include = includeCategorias
        ? [{ model: Categoria, as: "categorias" }]
        : [];
      return await Producto.findByPk(id, { include });
    } catch (err) {
      throw err;
    }
  }

  // Listar productos con paginación opcional
  async obtenerProductos({ limit, offset } = {}) {
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

  async actualizarProducto(id, data) {
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
            const cat = await Categoria.findByPk(c);
            if (cat) catInstances.push(cat);
          } else if (typeof c === "string") {
            const [cat] = await Categoria.findOrCreate({
              where: { nombre: c },
            });
            if (cat) catInstances.push(cat);
          }
        }

        if (catInstances.length) {
          await producto.setCategorias(catInstances);
        }
      }

      return producto;
    } catch (err) {
      throw err;
    }
  }

  async eliminarProducto(id) {
    const transaction = await db.sequelize.transaction();

    try {
      const producto = await Producto.findByPk(id, { transaction });

      if (!producto) {
        await transaction.rollback();
        throw new Error("Producto no encontrado");
      }

      // Las relaciones con categorías se eliminarán automáticamente por CASCADE
      // No necesitas hacer producto.setCategorias([])

      const deleted = await Producto.destroy({
        where: { id },
        transaction,
      });

      await transaction.commit();

      console.log("✅ Producto eliminado. Filas afectadas:", deleted);

      return deleted > 0;
    } catch (err) {
      await transaction.rollback();
      console.error("❌ Error en eliminarProducto:", err);

      if (err.name === "SequelizeForeignKeyConstraintError") {
        throw new Error(
          "No se puede eliminar el producto porque tiene ventas asociadas"
        );
      }

      throw err;
    }
  }

  async buscarPorNombre(nombre) {
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

  async filtrarPorCategoria(idCategoria) {
    try {
      const cat = await Categoria.findByPk(idCategoria);
      if (!cat) return [];
      return await cat.getProductos();
    } catch (err) {
      throw err;
    }
  }

  async calificar(idProducto, nuevaCalificacion) {
    await Producto.update(
      { calificacion: nuevaCalificacion },
      { where: { id: idProducto } }
    );
    return await Producto.findByPk(idProducto);
  }

  async obtenerCategoriasProducto(productoId) {
    const producto = await Producto.findByPk(productoId);
    // Cambia el throw por un return null
    if (!producto) return null;
    return await producto.getCategorias();
  }

  async obtenerMasVendidos(limit = 10) {
    try {
      const { VentaItem } = db;

      const resultado = await VentaItem.findAll({
        attributes: [
          "productoId",
          [fn("SUM", col("cantidad")), "totalVendido"],
        ],
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "nombre", "imagen", "calificacion"],
          },
        ],
        group: ["productoId", "producto.id"],
        order: [[fn("SUM", col("cantidad")), "DESC"]],
        limit,
      });

      return resultado.map((item) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        imagen: item.producto.imagen,
        calificacion: item.producto.calificacion,
        cantidadVendida: parseInt(item.dataValues.totalVendido),
      }));
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ProductoDAO();
