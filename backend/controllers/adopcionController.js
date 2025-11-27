const adopcionDAO = require("../daos/adopcionDAO.js");
const { AppError } = require("../utils/appError.js");

class AdopcionController {
  // Crear nueva solicitud de adopción
  static async crear(req, res, next) {
    try {
      const datosAdopcion = req.body;
      const nuevaAdopcion = await adopcionDAO.crearAdopcion(datosAdopcion);

      res.status(201).json({
        status: "success",
        message: "Solicitud de adopción creada exitosamente",
        data: nuevaAdopcion,
      });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return next(new AppError(error.message, 404));
      }
      if (error.name === "ConflictError") {
        return next(new AppError(error.message, 409));
      }
      next(
        new AppError(
          `Error al crear solicitud de adopción: ${error.message}`,
          500
        )
      );
    }
  }

  // Obtener todas las adopciones
  static async obtenerTodas(req, res, next) {
    try {
      const { includeUsuario, includeMascota, limit, offset, estadoSolicitud } =
        req.query;

      const options = {
        includeUsuario: includeUsuario === "true",
        includeMascota: includeMascota === "true",
      };

      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (estadoSolicitud) options.where = { estadoSolicitud };

      const adopciones = await adopcionDAO.obtenerAdopciones(options);

      res.status(200).json({
        status: "success",
        count: adopciones.length,
        data: adopciones,
      });
    } catch (error) {
      next(new AppError(`Error al obtener adopciones: ${error.message}`, 500));
    }
  }

  // Obtener adopción por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const { includeUsuario, includeMascota } = req.query;

      const adopcion = await adopcionDAO.obtenerAdopcionPorId(id, {
        includeUsuario: includeUsuario === "true",
        includeMascota: includeMascota === "true",
      });

      if (!adopcion) {
        return next(new AppError("Adopción no encontrada", 404));
      }

      res.status(200).json({
        status: "success",
        data: adopcion,
      });
    } catch (error) {
      next(new AppError(`Error al obtener adopción: ${error.message}`, 500));
    }
  }

  // Actualizar adopción
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;

      const adopcionActualizada = await adopcionDAO.actualizarAdopcion(
        id,
        datosActualizados
      );

      res.status(200).json({
        status: "success",
        message: "Adopción actualizada correctamente",
        data: adopcionActualizada,
      });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return next(new AppError(error.message, 404));
      }
      next(new AppError(`Error al actualizar adopción: ${error.message}`, 500));
    }
  }

  // Eliminar adopción
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await adopcionDAO.eliminarAdopcion(id);

      res.status(200).json({
        status: "success",
        message: "Adopción eliminada correctamente",
      });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return next(new AppError(error.message, 404));
      }
      next(new AppError(`Error al eliminar adopción: ${error.message}`, 500));
    }
  }

  // Obtener adopciones por usuario
  static async obtenerPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params; // CAMBIO: de userId a idUsuario
      const { includeMascota } = req.query;

      const adopciones = await adopcionDAO.obtenerAdopcionesPorUsuario(
        idUsuario,
        {
          includeMascota: includeMascota === "true",
          includeUsuario: false,
        }
      );

      res.status(200).json({
        status: "success",
        count: adopciones.length,
        data: adopciones,
      });
    } catch (error) {
      next(
        new AppError(
          `Error al obtener adopciones del usuario: ${error.message}`,
          500
        )
      );
    }
  }

  // Obtener adopciones por mascota
  static async obtenerPorMascota(req, res, next) {
    try {
      const { idMascota } = req.params; // CAMBIO: de petId a idMascota
      const { includeUsuario } = req.query;

      const adopciones = await adopcionDAO.obtenerAdopcionesPorMascota(
        idMascota,
        {
          includeUsuario: includeUsuario === "true",
          includeMascota: false,
        }
      );

      res.status(200).json({
        status: "success",
        count: adopciones.length,
        data: adopciones,
      });
    } catch (error) {
      next(
        new AppError(
          `Error al obtener adopciones de la mascota: ${error.message}`,
          500
        )
      );
    }
  }

  // Aprobar solicitud de adopción
  static async aprobar(req, res, next) {
    try {
      const { id } = req.params;
      const adopcionAprobada = await adopcionDAO.aprobarSolicitud(id);

      res.status(200).json({
        status: "success",
        message: "Solicitud de adopción aprobada correctamente",
        data: adopcionAprobada,
      });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return next(new AppError(error.message, 404));
      }
      if (error.name === "ConflictError") {
        return next(new AppError(error.message, 409));
      }
      next(new AppError(`Error al aprobar solicitud: ${error.message}`, 500));
    }
  }

  // Rechazar solicitud de adopción
  static async rechazar(req, res, next) {
    try {
      const { id } = req.params;
      const adopcionRechazada = await adopcionDAO.rechazarSolicitud(id);

      res.status(200).json({
        status: "success",
        message: "Solicitud de adopción rechazada",
        data: adopcionRechazada,
      });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return next(new AppError(error.message, 404));
      }
      if (error.name === "ConflictError") {
        return next(new AppError(error.message, 409));
      }
      next(new AppError(`Error al rechazar solicitud: ${error.message}`, 500));
    }
  }
}

module.exports = AdopcionController;
