const categoriaDAO = require("../daos/categoriaDAO.js");
const { AppError } = require("../utils/appError.js");

class CategoriaController {
  static async crearCategoria(req, res, next) {
    try {
      const { nombre, descripcion, activo } = req.body;

      if (!nombre) {
        return next(new AppError("El nombre de la categoría es obligatorio.", 400));
      }

      const categoria = await categoriaDAO.crearCategoria({
        nombre,
        descripcion,
        activo: activo ?? true,
      });

      res.status(201).json({
        status: "success",
        message: "Categoría creada correctamente.",
        data: categoria,
      });
    } catch (error) {
      next(new AppError(`Error al crear categoría: ${error.message}`, 500));
    }
  }

  static async obtenerCategorias(req, res, next) {
    try {
      const includeProductos = req.query.includeProductos === "true";
      const categorias = await categoriaDAO.obtenerCategorias({ includeProductos });

      res.status(200).json({
        status: "success",
        count: categorias.length,
        data: categorias,
      });
    } catch (error) {
      next(new AppError(`Error al obtener categorías: ${error.message}`, 500));
    }
  }

  static async actualizarCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const cambios = req.body;

      if (cambios.nombre !== undefined && cambios.nombre.trim() === "") {
        return next(new AppError("El nombre de la categoría no puede estar vacío.", 400));
      }

      const categoria = await categoriaDAO.actualizarCategoria(id, cambios);

      if (!categoria) {
        return next(new AppError("Categoría no encontrada.", 404));
      }

      res.status(200).json({
        status: "success",
        message: "Categoría actualizada correctamente.",
        data: categoria,
      });
    } catch (error) {
      next(new AppError(`Error al actualizar categoría: ${error.message}`, 500));
    }
  }

  static async eliminarCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const eliminadas = await categoriaDAO.eliminarCategoria(id);

      if (!eliminadas) {
        return next(new AppError("Categoría no encontrada.", 404));
      }

      res.status(200).json({
        status: "success",
        message: "Categoría eliminada correctamente.",
      });
    } catch (error) {
      next(new AppError(`Error al eliminar categoría: ${error.message}`, 500));
    }
  }
}

module.exports = CategoriaController;

