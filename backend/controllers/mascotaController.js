const mascotaDAO = require("../daos/mascotaDAO.js");
const { AppError } = require("../utils/appError.js");

class MascotaController {
  // Crear nueva mascota
  static async crear(req, res, next) {
    try {
      const datosMascota = req.body;
      const nuevaMascota = await mascotaDAO.crearMascota(datosMascota);
      
      res.status(201).json({
        status: "success",
        message: "Mascota creada exitosamente",
        data: nuevaMascota,
      });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return next(new AppError(error.message, 404));
      }
      next(new AppError(`Error al crear mascota: ${error.message}`, 500));
    }
  }

  // Obtener todas las mascotas
  static async obtenerTodas(req, res, next) {
    try {
      const { includeCentro, limit, offset, estado } = req.query;
      const options = {
        includeCentro: includeCentro === "true",
      };

      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (estado) options.where = { estado };

      const mascotas = await mascotaDAO.obtenerMascotas(options);
      
      res.status(200).json({
        status: "success",
        count: mascotas.length,
        data: mascotas,
      });
    } catch (error) {
      next(new AppError(`Error al obtener mascotas: ${error.message}`, 500));
    }
  }

  // Obtener mascota por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const { includeCentro } = req.query;
      
      const mascota = await mascotaDAO.obtenerMascotaPorId(id, {
        includeCentro: includeCentro === "true",
      });

      if (!mascota) {
        return next(new AppError("Mascota no encontrada", 404));
      }

      res.status(200).json({
        status: "success",
        data: mascota,
      });
    } catch (error) {
      next(new AppError(`Error al obtener mascota: ${error.message}`, 500));
    }
  }

  // Actualizar mascota
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;

      const mascotaActualizada = await mascotaDAO.actualizarMascota(
        id,
        datosActualizados
      );

      if (!mascotaActualizada) {
        return next(new AppError("Mascota no encontrada", 404));
      }

      res.status(200).json({
        status: "success",
        message: "Mascota actualizada correctamente",
        data: mascotaActualizada,
      });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return next(new AppError(error.message, 404));
      }
      next(new AppError(`Error al actualizar mascota: ${error.message}`, 500));
    }
  }

  // Eliminar mascota
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar si existe antes de eliminar
      const mascota = await mascotaDAO.obtenerMascotaPorId(id);
      if (!mascota) {
        return next(new AppError("Mascota no encontrada", 404));
      }

      await mascotaDAO.eliminarMascota(id);
      
      res.status(200).json({
        status: "success",
        message: "Mascota eliminada correctamente",
      });
    } catch (error) {
      next(new AppError(`Error al eliminar mascota: ${error.message}`, 500));
    }
  }

  // Obtener mascotas por centro de adopción
  static async obtenerPorCentro(req, res, next) {
    try {
      const { idCentro } = req.params;
      const { limit, offset } = req.query;

      const options = {
        where: { idCentroAdopcion: idCentro },
        includeCentro: true,
      };

      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);

      const mascotas = await mascotaDAO.obtenerMascotas(options);
      
      res.status(200).json({
        status: "success",
        count: mascotas.length,
        data: mascotas,
      });
    } catch (error) {
      next(new AppError(`Error al obtener mascotas del centro: ${error.message}`, 500));
    }
  }
}

module.exports = MascotaController;