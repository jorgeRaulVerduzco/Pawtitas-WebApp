const { Adopcion, Usuario, Mascota, sequelize } = require("../models");

class AdopcionDAO {
  constructor() {}

  async crearAdopcion(datosAdopcion) {
    try {
      // Validar usuario y mascota
      const usuario = await Usuario.findByPk(datosAdopcion.idUsuario);
      if (!usuario) {
        const err = new Error("Usuario no encontrado");
        err.name = "NotFoundError";
        throw err;
      }

      if (!usuario.activo) {
        const err = new Error(
          "Usuario inactivo, no puede crear solicitudes de adopción"
        );
        err.name = "ConflictError";
        throw err;
      }

      const mascota = await Mascota.findByPk(datosAdopcion.idMascota);
      if (!mascota) {
        const err = new Error("Mascota no encontrada");
        err.name = "NotFoundError";
        throw err;
      }

      if (mascota.estado !== "disponible") {
        const err = new Error("Mascota no disponible para adopción");
        err.name = "ConflictError";
        throw err;
      }

      const nuevaAdopcion = await Adopcion.create(datosAdopcion);
      return nuevaAdopcion;
    } catch (error) {
      throw new Error(`Error al crear adopción: ${error.message}`);
    }
  }

  async obtenerAdopciones() {
    try {
      const args = arguments[0] || {};
      const {
        includeUsuario = false,
        includeMascota = false,
        where = {},
        limit,
        offset,
      } = args;
      const findOptions = { where, order: [["fechaSolicitud", "DESC"]] };
      if (limit != null) findOptions.limit = limit;
      if (offset != null) findOptions.offset = offset;
      findOptions.include = [];
      if (includeUsuario)
        findOptions.include.push({ model: Usuario, as: "usuario" });
      if (includeMascota)
        findOptions.include.push({ model: Mascota, as: "mascota" });

      const adopciones = await Adopcion.findAll(findOptions);
      return adopciones;
    } catch (error) {
      throw new Error(`Error al obtener adopciones: ${error.message}`);
    }
  }

  async obtenerAdopcionPorId(id) {
    try {
      const args = arguments[1] || {};
      const { includeUsuario = false, includeMascota = false } = args;
      const findOptions = { include: [] };
      if (includeUsuario)
        findOptions.include.push({ model: Usuario, as: "usuario" });
      if (includeMascota)
        findOptions.include.push({ model: Mascota, as: "mascota" });

      const adopcion = await Adopcion.findByPk(id, findOptions);
      return adopcion;
    } catch (error) {
      throw new Error(`Error al obtener adopción: ${error.message}`);
    }
  }

  async actualizarAdopcion(id, datosActualizados) {
    try {
      const adopcion = await Adopcion.findByPk(id);
      if (!adopcion) {
        const err = new Error("Adopción no encontrada");
        err.name = "NotFoundError";
        throw err;
      }

      // Validar cambios
      if (datosActualizados.idUsuario) {
        const usuario = await Usuario.findByPk(datosActualizados.idUsuario);
        if (!usuario) {
          const err = new Error("Usuario no encontrado");
          err.name = "NotFoundError";
          throw err;
        }
      }

      if (datosActualizados.idMascota) {
        const mascota = await Mascota.findByPk(datosActualizados.idMascota);
        if (!mascota) {
          const err = new Error("Mascota no encontrada");
          err.name = "NotFoundError";
          throw err;
        }
      }

      await adopcion.update(datosActualizados);
      return adopcion;
    } catch (error) {
      throw new Error(`Error al actualizar adopción: ${error.message}`);
    }
  }

  async eliminarAdopcion(id) {
    try {
      const adopcion = await Adopcion.findByPk(id);
      if (!adopcion) {
        const err = new Error("Adopción no encontrada");
        err.name = "NotFoundError";
        throw err;
      }
      await adopcion.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar adopción: ${error.message}`);
    }
  }

  async obtenerAdopcionesPorUsuario(idUsuario, options = {}) {
    try {
      const where = { idUsuario };
      return this.obtenerAdopciones({ where, ...options });
    } catch (error) {
      throw new Error(
        `Error al obtener adopciones por usuario: ${error.message}`
      );
    }
  }

  async obtenerAdopcionesPorMascota(idMascota, options = {}) {
    try {
      const where = { idMascota };
      return this.obtenerAdopciones({ where, ...options });
    } catch (error) {
      throw new Error(
        `Error al obtener adopciones por mascota: ${error.message}`
      );
    }
  }

  async aprobarSolicitud(idAdopcion) {
    try {
      return sequelize.transaction(async (t) => {
        const adopcion = await Adopcion.findByPk(idAdopcion, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!adopcion) {
          const err = new Error("Adopción no encontrada");
          err.name = "NotFoundError";
          throw err;
        }

        if (adopcion.estadoSolicitud !== "pendiente") {
          const err = new Error(
            "Sólo se pueden aprobar solicitudes pendientes"
          );
          err.name = "ConflictError";
          throw err;
        }

        const mascota = await Mascota.findByPk(adopcion.idMascota, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!mascota || mascota.estado !== "disponible") {
          const err = new Error("Mascota no disponible");
          err.name = "ConflictError";
          throw err;
        }

        await mascota.update({ estado: "adoptado" }, { transaction: t });
        adopcion.estadoSolicitud = "aprobada";
        adopcion.fechaResolucion = new Date();
        await adopcion.save({ transaction: t });

        return adopcion;
      });
    } catch (error) {
      throw new Error(`Error al aprobar adopción: ${error.message}`);
    }
  }

  async rechazarSolicitud(idAdopcion) {
    try {
      const adopcion = await Adopcion.findByPk(idAdopcion);
      if (!adopcion) {
        const err = new Error("Adopción no encontrada");
        err.name = "NotFoundError";
        throw err;
      }

      if (adopcion.estadoSolicitud !== "pendiente") {
        const err = new Error("Sólo se pueden rechazar solicitudes pendientes");
        err.name = "ConflictError";
        throw err;
      }

      adopcion.estadoSolicitud = "rechazada";
      adopcion.fechaResolucion = new Date();
      await adopcion.save();
      return adopcion;
    } catch (error) {
      throw new Error(`Error al rechazar adopción: ${error.message}`);
    }
  }
}

module.exports = new AdopcionDAO();
