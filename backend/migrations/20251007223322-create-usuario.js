'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombres: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellidoPaterno: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellidoMaterno: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nombreUsuario: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      contrasena: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rol: {
        type: Sequelize.ENUM('cliente', 'empleado', 'administrador'),
        defaultValue: 'cliente',
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuarios');
  }
};