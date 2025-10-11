const { Usuario, sequelize } = require("../models");

class UsuarioDAO {
  static async crear(datos) {
    return await Usuario.create(datos);
  }

  static async obtenerTodos() {
    return await Usuario.findAll();
  }

  static async obtenerPorId(id) {
    return await Usuario.findByPk(id);
  }

  static async actualizar(id, cambios) {
    await Usuario.update(cambios, { where: { id } });
    return await Usuario.findByPk(id);
  }

  // "Eliminar" lo dejamos como desactivar para conservar integridad
  static async eliminar(id) {
    await Usuario.update({ activo: false }, { where: { id } });
    return true;
  }

  // INICIAR SESIÓN: sin imports externos, con consulta directa (parámetros)
  // Nota: usamos una query parametrizada para evitar inyección. No hay hashing.
  static async iniciarSesion(nombreUsuario, contrasena) {
    const sql = `
      SELECT * FROM usuarios
      WHERE "nombreUsuario" = :nombreUsuario
        AND contrasena = :contrasena
        AND activo = true
      LIMIT 1
    `;
    const [results] = await sequelize.query(sql, {
      replacements: { nombreUsuario, contrasena },
      type: sequelize.QueryTypes.SELECT,
      plain: false,
    });

    // sequelize.query con QueryTypes.SELECT devuelve array como primer valor
    // Si existe, results[0] es el usuario
    if (Array.isArray(results)) {
      return results.length > 0 ? results[0] : null;
    }
    // Si plain result interpreted different, handle:
    return results || null;
  }

  static async cambiarRol(idUsuario, nuevoRol) {
    await Usuario.update({ rol: nuevoRol }, { where: { id: idUsuario } });
    return await Usuario.findByPk(idUsuario);
  }

  static async activarDesactivar(idUsuario, activo) {
    await Usuario.update({ activo }, { where: { id: idUsuario } });
    return await Usuario.findByPk(idUsuario);
  }
}

module.exports = UsuarioDAO;
