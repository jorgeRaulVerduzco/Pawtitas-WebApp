const { CentroAdopcion, Mascota } = require("../models");
const { Op } = require("sequelize");

class CentroAdopcionDAO {
  constructor() {}

  async crear(datos) {
    try {
      return await CentroAdopcion.create(datos);
    } catch (error) {
      throw new Error(`Error al crear centro: ${error.message}`);
    }
  }

  async buscarPorNombre(nombre) {
    try {
      return await CentroAdopcion.findAll({
        where: {
          nombre: { [Op.like]: `%${nombre}%` },
        },
        include: [
          {
            model: Mascota,
            as: "mascotas",
            where: { estado: "disponible" },
            required: false,
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error al buscar centros: ${error.message}`);
    }
  }

  async obtenerTodos() {
    try {
      return await CentroAdopcion.findAll({
        include: [
          {
            model: Mascota,
            as: "mascotas",
            attributes: ["id", "nombre", "especie", "estado"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new Error(`Error al obtener centros: ${error.message}`);
    }
  }

  async obtenerPorId(id) {
    try {
      const centro = await CentroAdopcion.findByPk(id, {
        include: [
          {
            model: Mascota,
            as: "mascotas",
          },
        ],
      });

      if (!centro) {
        throw new Error("Centro no encontrado");
      }

      return centro;
    } catch (error) {
      throw new Error(`Error al obtener centro: ${error.message}`);
    }
  }
}


module.exports = new CentroAdopcionDAO();