'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Direccions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioId: {
        type: Sequelize.INTEGER
      },
      calle: {
        type: Sequelize.STRING
      },
      numeroExterior: {
        type: Sequelize.STRING
      },
      numeroInterior: {
        type: Sequelize.STRING
      },
      colonia: {
        type: Sequelize.STRING
      },
      ciudad: {
        type: Sequelize.STRING
      },
      codigoPostal: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Direccions');
  }
};