const { Mascota, CentroAdopcion } = require("../models");

class MascotaDAO {
  constructor() {}

  async crearMascota(datosMascota) {
    try {
      // validar que exista el centro de adopción si se proporciona
      if (datosMascota.idCentroAdopcion) {
        const centro = await CentroAdopcion.findByPk(
          datosMascota.idCentroAdopcion
        );
        if (!centro) {
          const err = new Error("Centro de adopción no encontrado");
          err.name = "NotFoundError";
          throw err;
        }
      }

      const nuevaMascota = await Mascota.create(datosMascota);
      return nuevaMascota;
    } catch (error) {
      throw new Error(`Error al crear mascota: ${error.message}`);
    }
  }

  async obtenerMascotas() {
    try {
      // Incluyendo los parametros del centro de adopción si se requieren
      const args = arguments[0] || {};
      const { includeCentro = false, where = {}, limit, offset } = args;
      const findOptions = { where };
      if (limit != null) findOptions.limit = limit;
      if (offset != null) findOptions.offset = offset;
      if (includeCentro) {
        findOptions.include = [{ model: CentroAdopcion, as: "centro" }];
      }

      const mascotas = await Mascota.findAll(findOptions);
      return mascotas;
    } catch (error) {
      throw new Error(`Error al obtener mascotas: ${error.message}`);
    }
  }

  async obtenerMascotaPorId(id) {
    try {
      const args = arguments[1] || {};
      const { includeCentro = false } = args;
      const findOptions = {};
      if (includeCentro) {
        findOptions.include = [{ model: CentroAdopcion, as: "centro" }];
      }

      const mascota = await Mascota.findByPk(id, findOptions);
      return mascota;
    } catch (error) {
      throw new Error(`Error al obtener mascota: ${error.message}`);
    }
  }

  async actualizarMascota(id, datosActualizados) {
    try {
      // Si se intenta cambiar el centro, validar que exista
      if (datosActualizados.idCentroAdopcion) {
        const centro = await CentroAdopcion.findByPk(
          datosActualizados.idCentroAdopcion
        );
        if (!centro) {
          const err = new Error("Centro de adopción no encontrado");
          err.name = "NotFoundError";
          throw err;
        }
      }

      await Mascota.update(datosActualizados, { where: { id } });
      const mascotaActualizada = await this.obtenerMascotaPorId(id, {
        includeCentro: true,
      });
      return mascotaActualizada;
    } catch (error) {
      throw new Error(`Error al actualizar mascota: ${error.message}`);
    }
  }

  async eliminarMascota(id) {
    try {
      await Mascota.destroy({ where: { id } });
    } catch (error) {
      throw new Error(`Error al eliminar mascota: ${error.message}`);
    }
  }
}

module.exports = new MascotaDAO();
