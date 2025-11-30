const { Venta, VentaItem, Producto, Pago, sequelize } = require("../models");

class VentaDAO {
  constructor() {}

  async crear(datos) {
    return await Venta.create(datos);
  }

  async obtenerTodos() {
    return await Venta.findAll({
      include: [
        { model: VentaItem, as: "items" },
        { model: Pago, as: "pagos" },
      ],
    });
  }

  async obtenerPorId(id) {
    return await Venta.findByPk(id, {
      include: [
        { model: VentaItem, as: "items" },
        { model: Pago, as: "pagos" },
      ],
    });
  }

  async obtenerPorCliente(idCliente) {
    return await Venta.findAll({ where: { clienteId: idCliente } });
  }

  async actualizarEstado(idVenta, nuevoEstado) {
    await Venta.update({ estado: nuevoEstado }, { where: { id: idVenta } });
    return await Venta.findByPk(idVenta);
  }

  async eliminar(id) {
    return await Venta.destroy({ where: { id } });
  }

  // crearVentaCompleta con transaction
  async crearVentaCompleta(clienteId, items = [], pagoData = null) {
    return await sequelize.transaction(async (t) => {
      let total = 0;
      const productosCache = {};

      for (const it of items) {
        const producto = await Producto.findByPk(it.productoId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!producto) throw new Error(`Producto ${it.productoId} no encontrado`);
        if (producto.cantidadStock < it.cantidad)
          throw new Error(`Stock insuficiente para producto ${producto.nombre}`);

        productosCache[it.productoId] = producto;
        total += parseFloat(producto.precio) * it.cantidad;
      }

      const venta = await Venta.create(
        {
          clienteId,
          total: total.toFixed(2),
          estado: "pendiente",
        },
        { transaction: t }
      );

      for (const it of items) {
        const producto = productosCache[it.productoId];

        await VentaItem.create(
          {
            ventaId: venta.id,
            productoId: producto.id,
            cantidad: it.cantidad,
            precio: producto.precio,
          },
          { transaction: t }
        );

        producto.cantidadStock = producto.cantidadStock - it.cantidad;
        await producto.save({ transaction: t });
      }

      let pago = null;
      if (pagoData) {
        pago = await Pago.create(
          {
            ventaId: venta.id,
            monto: pagoData.monto ?? total.toFixed(2),
            metodoPago: pagoData.metodoPago,
            referencia: pagoData.referencia ?? null,
            estado: pagoData.estado ?? "pendiente",
          },
          { transaction: t }
        );

        if (pago.estado === "aprobado") {
          venta.estado = "completada";
          await venta.save({ transaction: t });
        }
      }

      return { venta, pago };
    });
  }

  async agregarItemAVenta(ventaId, { productoId, cantidad }) {
    return await sequelize.transaction(async (t) => {
      const producto = await Producto.findByPk(productoId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!producto) throw new Error("Producto no encontrado");
      if (producto.cantidadStock < cantidad) throw new Error("Stock insuficiente");

      const item = await VentaItem.create(
        {
          ventaId,
          productoId,
          cantidad,
          precio: producto.precio,
        },
        { transaction: t }
      );

      producto.cantidadStock = producto.cantidadStock - cantidad;
      await producto.save({ transaction: t });

      const venta = await Venta.findByPk(ventaId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!venta) throw new Error("Venta no encontrada");
      venta.total = (parseFloat(venta.total) + parseFloat(producto.precio) * cantidad).toFixed(2);
      await venta.save({ transaction: t });

      return { item, venta };
    });
  }

  async crearPagoSeparado({ ventaId, monto, metodoPago, referencia = null, estado = "pendiente" }) {
    return await Pago.create({
      ventaId,
      monto,
      metodoPago,
      referencia,
      estado,
    });
  }

  async pagarVenta(ventaId, pagoData) {
    return await sequelize.transaction(async (t) => {
      const venta = await Venta.findByPk(ventaId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!venta) throw new Error("Venta no encontrada");

      const pago = await Pago.create(
        {
          ventaId,
          monto: pagoData.monto ?? venta.total,
          metodoPago: pagoData.metodoPago,
          referencia: pagoData.referencia ?? null,
          estado: pagoData.estado ?? "pendiente",
        },
        { transaction: t }
      );

      if (pago.estado === "aprobado") {
        venta.estado = "completada";
        await venta.save({ transaction: t });
      }

      return { pago, venta };
    });
  }

  async actualizarEstadoPago(idPago, nuevoEstado) {
    return await sequelize.transaction(async (t) => {
      const pago = await Pago.findByPk(idPago, { transaction: t, lock: t.LOCK.UPDATE });
      if (!pago) throw new Error("Pago no encontrado");

      pago.estado = nuevoEstado;
      await pago.save({ transaction: t });

      if (nuevoEstado === "aprobado") {
        const venta = await Venta.findByPk(pago.ventaId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!venta) throw new Error("Venta asociada no encontrada");
        venta.estado = "completada";
        await venta.save({ transaction: t });
        return { pago, venta };
      }

      return { pago };
    });
  }

  async obtenerHistorialPorUsuario(idUsuario) {
    return await Venta.findAll({
      where: { clienteId: idUsuario },
      include: [
        {
          model: VentaItem,
          as: "items",
          include: [{ model: Producto, as: "producto" }],
        },
        { model: Pago, as: "pagos" },
      ],
      order: [["fechaVenta", "DESC"]],
    });
  }
}

module.exports = new VentaDAO();