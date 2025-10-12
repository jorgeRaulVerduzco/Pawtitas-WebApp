const { Usuario, sequelize } = require("../models");

class UsuarioDAO {
  constructor() {}

  async crear(datos) {
    return await Usuario.create(datos);
  }

  async obtenerTodos() {
    return await Usuario.findAll();
  }

  async obtenerPorId(id) {
    return await Usuario.findByPk(id);
  }

  async actualizar(id, cambios) {
    await Usuario.update(cambios, { where: { id } });
    return await Usuario.findByPk(id);
  }

  // "Eliminar" lo dejamos como desactivar para conservar integridad
  async eliminar(id) {
    await Usuario.update({ activo: false }, { where: { id } });
    return true;
  }

  // iniciarSesion con findOne (más sencillo y seguro que raw SQL)
  async iniciarSesion(nombreUsuario, contrasena) {
    return await Usuario.findOne({
      where: { nombreUsuario, contrasena, activo: true },
    });
  }

  async cambiarRol(idUsuario, nuevoRol) {
    await Usuario.update({ rol: nuevoRol }, { where: { id: idUsuario } });
    return await Usuario.findByPk(idUsuario);
  }

  async activarDesactivar(idUsuario, activo) {
    await Usuario.update({ activo }, { where: { id: idUsuario } });
    return await Usuario.findByPk(idUsuario);
  }
}

module.exports = new UsuarioDAO();