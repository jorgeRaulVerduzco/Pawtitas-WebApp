const { Venta, VentaItem, Producto, Pago, sequelize } = require("../models");

class VentaDAO {
  // CRUD básicos
  static async crear(datos) {
    return await Venta.create(datos);
  }

  static async obtenerTodos() {
    return await Venta.findAll({
      include: [
        { model: VentaItem, as: "items" },
        { model: Pago, as: "pagos" }
      ]
    });
  }

  static async obtenerPorId(id) {
    return await Venta.findByPk(id, {
      include: [
        { model: VentaItem, as: "items" },
        { model: Pago, as: "pagos" }
      ]
    });
  }

  static async obtenerPorCliente(idCliente) {
    return await Venta.findAll({ where: { clienteId: idCliente } });
  }

  static async actualizarEstado(idVenta, nuevoEstado) {
    await Venta.update({ estado: nuevoEstado }, { where: { id: idVenta } });
    return await Venta.findByPk(idVenta);
  }

  static async eliminar(id) {
    return await Venta.destroy({ where: { id } });
  }

  // === 1) crearVentaCompleta: crea venta + items + pago, y descuenta stock (TRANSACTION) ===
  // items = [{ productoId, cantidad }]
  // pagoData = { metodoPago, referencia, estado, monto } (monto opcional; si no se pasa se usa total calculado)
  static async crearVentaCompleta(clienteId, items = [], pagoData = null) {
    return await sequelize.transaction(async (t) => {
      // 1) verificar y calcular total bloqueando productos
      let total = 0;
      const productosCache = {};

      for (const it of items) {
        const producto = await Producto.findByPk(it.productoId, {
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (!producto) throw new Error(`Producto ${it.productoId} no encontrado`);
        if (producto.cantidadStock < it.cantidad) throw new Error(`Stock insuficiente para producto ${producto.nombre}`);

        productosCache[it.productoId] = producto;
        total += parseFloat(producto.precio) * it.cantidad;
      }

      // 2) crear venta con total calculado
      const venta = await Venta.create({
        clienteId,
        total: total.toFixed(2),
        estado: "pendiente"
      }, { transaction: t });

      // 3) crear items y descontar stock
      for (const it of items) {
        const producto = productosCache[it.productoId];

        await VentaItem.create({
          ventaId: venta.id,
          productoId: producto.id,
          cantidad: it.cantidad,
          precio: producto.precio
        }, { transaction: t });

        // descontar stock
        producto.cantidadStock = producto.cantidadStock - it.cantidad;
        await producto.save({ transaction: t });
      }

      // 4) si se envía pagoData, crear pago y, si está aprobado, completar venta
      let pago = null;
      if (pagoData) {
        pago = await Pago.create({
          ventaId: venta.id,
          monto: pagoData.monto ?? total.toFixed(2),
          metodoPago: pagoData.metodoPago,
          referencia: pagoData.referencia ?? null,
          estado: pagoData.estado ?? "pendiente"
        }, { transaction: t });

        if (pago.estado === "aprobado") {
          venta.estado = "completada";
          await venta.save({ transaction: t });
        }
      }

      // Retornar venta con items (no hacemos include por performance dentro de la transacción)
      return { venta, pago };
    });
  }

  // === 2) agregarItemAVenta: agrega item a venta existente (descuenta stock y actualiza total) ===
  static async agregarItemAVenta(ventaId, { productoId, cantidad }) {
    return await sequelize.transaction(async (t) => {
      // bloquear producto
      const producto = await Producto.findByPk(productoId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!producto) throw new Error("Producto no encontrado");
      if (producto.cantidadStock < cantidad) throw new Error("Stock insuficiente");

      // crear item
      const item = await VentaItem.create({
        ventaId,
        productoId,
        cantidad,
        precio: producto.precio
      }, { transaction: t });

      // descontar stock
      producto.cantidadStock = producto.cantidadStock - cantidad;
      await producto.save({ transaction: t });

      // actualizar total de la venta
      const venta = await Venta.findByPk(ventaId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!venta) throw new Error("Venta no encontrada");
      venta.total = (parseFloat(venta.total) + parseFloat(producto.precio) * cantidad).toFixed(2);
      await venta.save({ transaction: t });

      return { item, venta };
    });
  }

  // === 3) crearPagoSeparado: crea un pago vinculado a una venta ===
  static async crearPagoSeparado({ ventaId, monto, metodoPago, referencia = null, estado = "pendiente" }) {
    return await Pago.create({
      ventaId,
      monto,
      metodoPago,
      referencia,
      estado
    });
  }

  // === 4) pagarVenta: crea pago y si queda aprobado actualiza venta a 'completada' ===
  // pagoData = { metodoPago, referencia, monto, estado }
  static async pagarVenta(ventaId, pagoData) {
    return await sequelize.transaction(async (t) => {
      // verificar venta
      const venta = await Venta.findByPk(ventaId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!venta) throw new Error("Venta no encontrada");

      // crear pago
      const pago = await Pago.create({
        ventaId,
        monto: pagoData.monto ?? venta.total,
        metodoPago: pagoData.metodoPago,
        referencia: pagoData.referencia ?? null,
        estado: pagoData.estado ?? "pendiente"
      }, { transaction: t });

      // si el pago es aprobado, completar la venta
      if (pago.estado === "aprobado") {
        venta.estado = "completada";
        await venta.save({ transaction: t });
      }

      return { pago, venta };
    });
  }

  // === 5) actualizarEstadoPago: actualizar estado de pago existente y, si se aprueba, actualizar venta ===
  static async actualizarEstadoPago(idPago, nuevoEstado) {
    return await sequelize.transaction(async (t) => {
      const pago = await Pago.findByPk(idPago, { transaction: t, lock: t.LOCK.UPDATE });
      if (!pago) throw new Error("Pago no encontrado");

      // actualizar estado del pago
      pago.estado = nuevoEstado;
      await pago.save({ transaction: t });

      // si se aprueba el pago, actualizar la venta a completada
      if (nuevoEstado === "aprobado") {
        const venta = await Venta.findByPk(pago.ventaId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!venta) throw new Error("Venta asociada no encontrada");
        venta.estado = "completada";
        await venta.save({ transaction: t });
        return { pago, venta };
      }

      // si se rechaza, dejamos la venta pendiente o la política que prefieras
      return { pago };
    });
  }

  // historial por usuario (compras)
  static async obtenerHistorialPorUsuario(idUsuario) {
    return await Venta.findAll({
      where: { clienteId: idUsuario },
      include: [{ model: VentaItem, as: "items" }, { model: Pago, as: "pagos" }],
      order: [["fechaVenta", "DESC"]],
    });
  }
}

module.exports = VentaDAO;