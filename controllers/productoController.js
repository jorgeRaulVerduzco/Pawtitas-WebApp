import productoDAO from "../daos/productoDAO.js";
import { AppError } from "../utils/appError.js";

class ProductoController {
  // Crear producto con categorías opcionales
  static async crearProducto(req, res, next) {
    try {
      const { nombre, descripcion, precio, cantidadStock, activo, categorias } = req.body;

      if (!nombre || !precio || cantidadStock === undefined) {
        return next(new AppError("Los campos nombre, precio y cantidadStock son requeridos.", 400));
      }

      const nuevoProducto = await productoDAO.crearProducto({
        nombre,
        descripcion,
        precio,
        cantidadStock,
        activo: activo ?? true,
        categorias,
      });

      res.status(201).json({
        status: "success",
        message: "Producto creado correctamente.",
        data: nuevoProducto,
      });
    } catch (error) {
      next(new AppError(`Error al crear producto: ${error.message}`, 500));
    }
  }

  // Obtener producto por ID (con categorias si es que se ocupa despues)
  static async obtenerProductoPorId(req, res, next) {
    try {
      const { id } = req.params;
      const includeCategorias = req.query.includeCategorias === "true";

      const producto = await productoDAO.obtenerProductoPorId(id, { includeCategorias });
      if (!producto) {
        return next(new AppError("Producto no encontrado.", 404));
      }

      res.status(200).json({
        status: "success",
        data: producto,
      });
    } catch (error) {
      next(new AppError(`Error al obtener producto: ${error.message}`, 500));
    }
  }

  // Listar productos 
  static async obtenerProductos(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const productos = await productoDAO.obtenerProductos({ limit, offset });
      if (!productos.length) {
        return next(new AppError("No se encontraron productos.", 404));
      }

      res.status(200).json({
        status: "success",
        count: productos.length,
        data: productos,
      });
    } catch (error) {
      next(new AppError(`Error al obtener productos: ${error.message}`, 500));
    }
  }

  // Actualizar producto por ID
  static async actualizarProducto(req, res, next) {
    try {
      const { id } = req.params;
      const productoExistente = await productoDAO.obtenerProductoPorId(id);

      if (!productoExistente) {
        return next(new AppError("Producto no encontrado.", 404));
      }

      const productoActualizado = await productoDAO.actualizarProducto(id, req.body);

      res.status(200).json({
        status: "success",
        message: "Producto actualizado correctamente.",
        data: productoActualizado,
      });
    } catch (error) {
      next(new AppError(`Error al actualizar producto: ${error.message}`, 500));
    }
  }

  // Eliminar producto
  static async eliminarProducto(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await productoDAO.obtenerProductoPorId(id);

      if (!producto) {
        return next(new AppError("Producto no encontrado.", 404));
      }

      await productoDAO.eliminarProducto(id);
      res.status(200).json({
        status: "success",
        message: "Producto eliminado correctamente.",
      });
    } catch (error) {
      next(new AppError(`Error al eliminar producto: ${error.message}`, 500));
    }
  }

  // Buscar productos por nombre
  static async buscarPorNombre(req, res, next) {
    try {
      const { nombre } = req.query;
      if (!nombre) {
        return next(new AppError("Debe especificar un nombre para buscar.", 400));
      }

      const productos = await productoDAO.buscarPorNombre(nombre);
      res.status(200).json({
        status: "success",
        results: productos.length,
        data: productos,
      });
    } catch (error) {
      next(new AppError(`Error al buscar productos: ${error.message}`, 500));
    }
  }

  // Filtrar productos por categoria
  static async filtrarPorCategoria(req, res, next) {
    try {
      const { idCategoria } = req.params;
      const productos = await productoDAO.filtrarPorCategoria(idCategoria);

      if (!productos.length) {
        return next(new AppError("No hay productos para esta categoria.", 404));
      }

      res.status(200).json({
        status: "success",
        results: productos.length,
        data: productos,
      });
    } catch (error) {
      next(new AppError(`Error al filtrar productos por categoria: ${error.message}`, 500));
    }
  }

  // Calificar producto
  static async calificarProducto(req, res, next) {
    try {
      const { id } = req.params;
      const { calificacion } = req.body;

      if (typeof calificacion !== "number" || calificacion < 0 || calificacion > 5) {
        return next(new AppError("La calificacion debe ser un numero entre 0 y 5.", 400));
      }

      const producto = await productoDAO.calificar(id, calificacion);
      if (!producto) {
        return next(new AppError("Producto no encontrado.", 404));
      }

      res.status(200).json({
        status: "success",
        message: "Calificacion actualizada correctamente.",
        data: producto,
      });
    } catch (error) {
      next(new AppError(`Error al calificar producto: ${error.message}`, 500));
    }
  }

  // Obtener categorias de un producto
  static async obtenerCategoriasProducto(req, res, next) {
    try {
      const { id } = req.params;
      const categorias = await productoDAO.obtenerCategoriasProducto(id);

      res.status(200).json({
        status: "success",
        data: categorias,
      });
    } catch (error) {
      next(new AppError(`Error al obtener categorias del producto: ${error.message}`, 500));
    }
  }
}

export default ProductoController;