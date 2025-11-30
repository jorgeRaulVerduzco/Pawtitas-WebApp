const ventaDAO = require("../daos/ventaDAO.js");
const { AppError } = require("../utils/appError.js");

class VentaController {
  // crear venta completa
  static async crearVentaCompleta(req, res, next) {
    try {
      const clienteId = req.body.clienteId ?? req.user?.id;
      const items = req.body.items ?? [];
      const pagoData = req.body.pago ?? null;

      if (!clienteId) return next(new AppError("clienteId es requerido", 400));
      if (!Array.isArray(items) || items.length === 0)
        return next(new AppError("items es un arreglo no vacío requerido", 400));

      const result = await ventaDAO.crearVentaCompleta(clienteId, items, pagoData);
      
      res.status(201).json({
        status: "success",
        message: "Venta creada correctamente",
        data: result,
      });
    } catch (error) {
      next(new AppError(error.message || "Error al crear la venta", 500));
    }
  }

  static async obtenerVentas(req, res, next) {
    try {
      const ventas = await ventaDAO.obtenerTodos();
      if (!ventas || ventas.length === 0) {
        return res.status(200).json({ status: "success", count: 0, data: [] });
      }
      res.status(200).json({ status: "success", count: ventas.length, data: ventas });
    } catch (error) {
      next(new AppError("Error al obtener ventas", 500));
    }
  }

  static async obtenerVentaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const venta = await ventaDAO.obtenerPorId(id);
      if (!venta) return next(new AppError("Venta no encontrada", 404));
      res.status(200).json({ status: "success", data: venta });
    } catch (error) {
      next(new AppError("Error al obtener la venta", 500));
    }
  }

  static async obtenerVentasPorCliente(req, res, next) {
    try {
      const idCliente = req.params.idCliente ?? req.user?.id;
      if (!idCliente) return next(new AppError("idCliente requerido", 400));
      const ventas = await ventaDAO.obtenerPorCliente(idCliente);
      res.status(200).json({ status: "success", count: ventas.length, data: ventas });
    } catch (error) {
      next(new AppError("Error al obtener ventas por cliente", 500));
    }
  }

  static async agregarItemAVenta(req, res, next) {
    try {
      const { ventaId } = req.params;
      const { productoId, cantidad } = req.body;
      if (!productoId || !cantidad)
        return next(new AppError("productoId y cantidad son requeridos", 400));

      const result = await ventaDAO.agregarItemAVenta(ventaId, { productoId, cantidad });
      
      res.status(201).json({
        status: "success",
        message: "Item agregado a la venta",
        data: result,
      });
    } catch (error) {
      next(new AppError(error.message || "Error al agregar item a la venta", 500));
    }
  }

  static async crearPagoSeparado(req, res, next) {
    try {
      const { ventaId } = req.params;
      const { monto, metodoPago, referencia, estado } = req.body;
      if (!ventaId || !monto || !metodoPago)
        return next(new AppError("ventaId, monto y metodoPago son requeridos", 400));

      const pago = await ventaDAO.crearPagoSeparado({
        ventaId,
        monto,
        metodoPago,
        referencia,
        estado,
      });
      res.status(201).json({ status: "success", message: "Pago creado", data: pago });
    } catch (error) {
      next(new AppError("Error al crear pago", 500));
    }
  }

  static async pagarVenta(req, res, next) {
    try {
      const { ventaId } = req.params;
      const pagoData = req.body;
      if (!ventaId) return next(new AppError("ventaId requerido", 400));
      if (!pagoData || !pagoData.metodoPago)
        return next(new AppError("pago.metodoPago es requerido", 400));

      const result = await ventaDAO.pagarVenta(ventaId, pagoData);
      res.status(200).json({ status: "success", message: "Pago procesado", data: result });
    } catch (error) {
      next(new AppError(error.message || "Error al procesar pago", 500));
    }
  }

  static async actualizarEstadoPago(req, res, next) {
    try {
      const { idPago } = req.params;
      const { nuevoEstado } = req.body;
      if (!idPago || !nuevoEstado)
        return next(new AppError("idPago y nuevoEstado son requeridos", 400));

      const result = await ventaDAO.actualizarEstadoPago(idPago, nuevoEstado);
      res.status(200).json({
        status: "success",
        message: "Estado de pago actualizado",
        data: result,
      });
    } catch (error) {
      next(new AppError(error.message || "Error al actualizar estado de pago", 500));
    }
  }

  static async obtenerHistorialPorUsuario(req, res, next) {
    try {
      // Aceptar `idUsuario` o `idUser` (las rutas usan `idUser`) y fallback a req.user.id
      const idUsuario = req.params.idUsuario ?? req.params.idUser ?? req.user?.id;
      if (!idUsuario) return next(new AppError("idUsuario requerido", 400));

      const historial = await ventaDAO.obtenerHistorialPorUsuario(idUsuario);
      res.status(200).json({ status: "success", count: historial.length, data: historial });
    } catch (error) {
      next(new AppError("Error al obtener historial de usuario", 500));
    }
  }
}

module.exports = VentaController;