const { Pago } = require("../models");

class PagoDAO {
  static async crear(datos) {
    return await Pago.create(datos);
  }

  static async obtenerTodos() {
    return await Pago.findAll();
  }

  static async obtenerPorId(id) {
    return await Pago.findByPk(id);
  }

  static async obtenerPorVenta(idVenta) {
    return await Pago.findAll({ where: { ventaId: idVenta } });
  }

  static async actualizarEstado(idPago, nuevoEstado) {
    await Pago.update({ estado: nuevoEstado }, { where: { id: idPago } });
    return await Pago.findByPk(idPago);
  }

  static async eliminar(id) {
    return await Pago.destroy({ where: { id } });
  }
}

module.exports = PagoDAO;