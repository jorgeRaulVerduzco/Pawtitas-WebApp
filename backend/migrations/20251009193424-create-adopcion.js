"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("adopciones", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      idUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      idMascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "mascotas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      tipoVivienda: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tienePatio: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      fechaSolicitud: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      fechaResolucion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      razonAdopcion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tieneExperiencia: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      estadoSolicitud: {
        type: Sequelize.ENUM("pendiente", "aprobada", "rechazada"),
        defaultValue: "pendiente",
        allowNull: false,
      },
      documentosSolicitud: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("adopciones");
  },
};
