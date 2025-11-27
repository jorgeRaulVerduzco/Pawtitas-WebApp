const pagoDAO = require("../daos/pagoDAO.js");
const ventaDAO = require("../daos/ventaDAO.js"); // para actualizar venta si el pago se aprueba
const { AppError } = require("../utils/appError.js");

class PagoController {
  static async crearPago(req, res, next) {
    try {
      const { ventaId, monto, metodoPago, referencia, estado } = req.body;

      if (!ventaId || !monto || !metodoPago) {
        return next(
          new AppError("ventaId, monto y metodoPago son requeridos", 400)
        );
      }

      // crear pago (DAO simplon)
      const pago = await pagoDAO.crear({
        ventaId,
        monto,
        metodoPago,
        referencia: referencia ?? null,
        estado: estado ?? "pendiente",
      });

      let resultado = { pago };
      if (pago.estado === "aprobado") {
        try {
          resultado = await ventaDAO.actualizarEstadoPago(pago.id, "aprobado");
        } catch (err) {
          return next(
            new AppError(
              `Pago creado pero error al actualizar venta: ${err.message}`,
              500
            )
          );
        }
      }

      res.status(201).json({
        status: "success",
        message: "Pago creado correctamente",
        data: resultado,
      });
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes("not null")) {
        return next(new AppError(error.message, 400));
      }
      next(new AppError(error.message || "Error al crear el pago", 500));
    }
  }

  // GET /pagos
  static async obtenerPagos(req, res, next) {
    try {
      const pagos = await pagoDAO.obtenerTodos();
      res
        .status(200)
        .json({ status: "success", count: pagos.length, data: pagos });
    } catch (error) {
      next(new AppError("Error al obtener los pagos", 500));
    }
  }

  static async obtenerPagoPorId(req, res, next) {
    try {
      const { id } = req.params;
      const pago = await pagoDAO.obtenerPorId(id);
      if (!pago) return next(new AppError("Pago no encontrado", 404));
      res.status(200).json({ status: "success", data: pago });
    } catch (error) {
      next(new AppError("Error al obtener el pago", 500));
    }
  }

  static async obtenerPagosPorVenta(req, res, next) {
    try {
      const { ventaId } = req.params;
      if (!ventaId) return next(new AppError("ventaId requerido", 400));
      const pagos = await pagoDAO.obtenerPorVenta(ventaId);
      res
        .status(200)
        .json({ status: "success", count: pagos.length, data: pagos });
    } catch (error) {
      next(new AppError("Error al obtener pagos por venta", 500));
    }
  }

  static async actualizarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;
      if (!nuevoEstado)
        return next(new AppError("nuevoEstado es requerido", 400));
      if (!["pendiente", "aprobado", "rechazado"].includes(nuevoEstado)) {
        return next(new AppError("Estado inválido", 400));
      }

      try {
        const result = await ventaDAO.actualizarEstadoPago(id, nuevoEstado);
        return res.status(200).json({
          status: "success",
          message: "Estado de pago actualizado",
          data: result, // { pago } o { pago, venta }
        });
      } catch (err) {
        if (err) {
          const pagoSolo = await pagoDAO.actualizarEstado(id, nuevoEstado);
          return res.status(200).json({
            status: "success",
            message: "Estado del pago actualizado (fallback sin afectar venta)",
            data: { pago: pagoSolo },
          });
        }
      }
    } catch (error) {
      if (
        error.message &&
        error.message.toLowerCase().includes("no encontrado")
      ) {
        return next(new AppError(error.message, 404));
      }
      next(new AppError("Error al actualizar el estado del pago", 500));
    }
  }

  static async eliminarPago(req, res, next) {
    try {
      const { id } = req.params;
      const eliminado = await pagoDAO.eliminar(id);
      if (!eliminado) {
        return next(new AppError("Pago no encontrado o no eliminado", 404));
      }
      res
        .status(200)
        .json({ status: "success", message: "Pago eliminado correctamente" });
    } catch (error) {
      next(new AppError("Error al eliminar el pago", 500));
    }
  }
}

module.exports = PagoController;