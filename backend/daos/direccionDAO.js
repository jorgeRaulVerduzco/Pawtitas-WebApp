const { Direccion } = require("../models");

class DireccionDAO {
  async crear(usuarioId, data) {
    return await Direccion.create({ ...data, usuarioId });
  }

  async obtenerPorUsuario(usuarioId) {
    return await Direccion.findAll({
      where: { usuarioId },
      order: [["createdAt", "DESC"]],
    });
  }

  async obtenerPorId(id) {
    return await Direccion.findByPk(id);
  }

  async actualizar(id, cambios) {
    const direccion = await Direccion.findByPk(id);
    if (!direccion) {
      return null;
    }
    return await direccion.update(cambios);
  }

  async eliminar(id) {
    return await Direccion.destroy({ where: { id } });
  }
}

module.exports = new DireccionDAO();


