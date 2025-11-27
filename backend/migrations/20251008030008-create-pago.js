'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pagos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ventaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Ventas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      metodoPago: {
        type: Sequelize.ENUM('efectivo', 'tarjeta', 'transferencia'),
        allowNull: false
      },
      referencia: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fechaPago: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado'),
        defaultValue: 'pendiente',
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
    await queryInterface.dropTable('Pagos');
  }
};