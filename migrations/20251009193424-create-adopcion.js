'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Adopciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fechaSolicitud: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fechaResolucion: {
        type: Sequelize.DATE
      },
      razonAdopcion: {
        type: Sequelize.TEXT
      },
      documentosSolicitud: {
        type: Sequelize.STRING
      },
      tieneExperiencia: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      estadoSolicitud: {
        type: Sequelize.STRING,
        defaultValue: 'pendiente'
      },
      tipoVivienda: {
        type: Sequelize.STRING
      },
      tienePatio: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Adopciones');
  }
};
