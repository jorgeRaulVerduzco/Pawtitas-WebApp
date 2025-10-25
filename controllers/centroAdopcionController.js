const centroAdopcionDAO = require("../daos/centroAdopcionDAO.js");
const { AppError } = require("../utils/appError.js");

class CentroAdopcionController {
  // Crear centro
  async crearCentro(req, res, next) {
    try {
      const datos = req.body;

      if (!datos.nombre || !datos.correo || !datos.telefono) {
        return next(
          new AppError("Los campos nombre, correo y teléfono son obligatorios.", 400)
        );
      }

      const nuevoCentro = await centroAdopcionDAO.crear(datos);
      console.log("Centro de adopción creado:", nuevoCentro.toJSON());

      res.status(201).json({
        mensaje: "Centro de adopción creado correctamente",
        centro: nuevoCentro,
      });
    } catch (error) {
      next(new AppError(`Error al crear centro: ${error.message}`, 500));
    }
  }

  // Buscar por nombre (query param: ?nombre=algo)
  async buscarPorNombre(req, res, next) {
    try {
      const { nombre } = req.query;

      if (!nombre) {
        return next(new AppError("Debe especificar un nombre para buscar.", 400));
      }

      const centros = await centroAdopcionDAO.buscarPorNombre(nombre);
      console.log(`Resultados de búsqueda para "${nombre}":`, centros.length);

      res.json({
        mensaje: `Se encontraron ${centros.length} centros.`,
        centros,
      });
    } catch (error) {
      next(new AppError(`Error al buscar centros: ${error.message}`, 500));
    }
  }

  // Obtener todos
  async obtenerTodos(req, res, next) {
    try {
      const centros = await centroAdopcionDAO.obtenerTodos();
      console.log("Centros encontrados:", centros.length);

      res.json({
        mensaje: "Centros de adopción obtenidos correctamente",
        total: centros.length,
        centros,
      });
    } catch (error) {
      next(new AppError(`Error al obtener centros: ${error.message}`, 500));
    }
  }

  // Obtener por ID
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return next(new AppError("Debe especificar un ID válido.", 400));
      }

      const centro = await centroAdopcionDAO.obtenerPorId(id);

      if (!centro) {
        return next(new AppError("Centro de adopción no encontrado.", 404));
      }

      console.log("Centro encontrado:", centro.nombre);

      res.json({
        mensaje: "Centro encontrado correctamente",
        centro,
      });
    } catch (error) {
      next(new AppError(`Error al obtener centro: ${error.message}`, 500));
    }
  }
}
module.exports = new CentroAdopcionController();
