const direccionDAO = require("../daos/direccionDAO.js");
const { AppError } = require("../utils/appError.js");

class DireccionController {
  static async listar(req, res, next) {
    try {
      const direcciones = await direccionDAO.obtenerPorUsuario(req.user.id);

      res.status(200).json({
        status: "success",
        count: direcciones.length,
        data: direcciones,
      });
    } catch (error) {
      next(new AppError(`Error al obtener direcciones: ${error.message}`, 500));
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const direccion = await direccionDAO.obtenerPorId(id);

      if (!direccion || direccion.usuarioId !== req.user.id) {
        return next(new AppError("Dirección no encontrada", 404));
      }

      res.status(200).json({ status: "success", data: direccion });
    } catch (error) {
      next(new AppError(`Error al obtener dirección: ${error.message}`, 500));
    }
  }

  static async crear(req, res, next) {
    try {
      const datos = DireccionController.#validarPayload(req.body);
      const direccion = await direccionDAO.crear(req.user.id, datos);

      res.status(201).json({
        status: "success",
        message: "Dirección agregada correctamente",
        data: direccion,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      next(new AppError(`Error al crear dirección: ${error.message}`, 500));
    }
  }

  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const direccion = await direccionDAO.obtenerPorId(id);

      if (!direccion || direccion.usuarioId !== req.user.id) {
        return next(new AppError("Dirección no encontrada", 404));
      }

      const datos = DireccionController.#validarPayload(req.body, true);
      const actualizada = await direccionDAO.actualizar(id, datos);

      res.status(200).json({
        status: "success",
        message: "Dirección actualizada correctamente",
        data: actualizada,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      next(new AppError(`Error al actualizar dirección: ${error.message}`, 500));
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const direccion = await direccionDAO.obtenerPorId(id);

      if (!direccion || direccion.usuarioId !== req.user.id) {
        return next(new AppError("Dirección no encontrada", 404));
      }

      await direccionDAO.eliminar(id);

      res.status(200).json({
        status: "success",
        message: "Dirección eliminada correctamente",
      });
    } catch (error) {
      next(new AppError(`Error al eliminar dirección: ${error.message}`, 500));
    }
  }

  static #validarPayload(body, parcial = false) {
    const campos = ["calle", "numeroExterior", "colonia", "ciudad", "codigoPostal"];
    const payload = {};

    if (!parcial) {
      for (const campo of campos) {
        if (!body[campo] || String(body[campo]).trim() === "") {
          throw new AppError(`El campo ${campo} es requerido`, 400);
        }
        payload[campo] = String(body[campo]).trim();
      }
    } else {
      for (const campo of campos.concat("numeroInterior")) {
        if (body[campo] !== undefined) {
          const valor = String(body[campo]).trim();
          if (!valor && campo !== "numeroInterior") {
            throw new AppError(`El campo ${campo} no puede estar vacío`, 400);
          }
          payload[campo] = valor;
        }
      }
    }

    if (!parcial && body.numeroInterior !== undefined) {
      payload.numeroInterior = String(body.numeroInterior).trim();
    } else if (parcial && body.numeroInterior !== undefined) {
      payload.numeroInterior = String(body.numeroInterior).trim();
    }

    return payload;
  }
}

module.exports = DireccionController;


