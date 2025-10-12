const { Pago } = require("../models");

class PagoDAO {
  constructor() {}

  async crear(datos) {
    return await Pago.create(datos);
  }

  async obtenerTodos() {
    return await Pago.findAll();
  }

  async obtenerPorId(id) {
    return await Pago.findByPk(id);
  }

  async obtenerPorVenta(idVenta) {
    return await Pago.findAll({ where: { ventaId: idVenta } });
  }

  async actualizarEstado(idPago, nuevoEstado) {
    await Pago.update({ estado: nuevoEstado }, { where: { id: idPago } });
    return await Pago.findByPk(idPago);
  }

  async eliminar(id) {
    return await Pago.destroy({ where: { id } });
  }
}

module.exports = new PagoDAO();