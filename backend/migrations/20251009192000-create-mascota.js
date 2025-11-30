'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mascotas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idCentroAdopcion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'centro_adopciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      especie: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      raza: {
        type: Sequelize.STRING,
        allowNull: true
      },
      edad: {
        type: Sequelize.STRING,
        allowNull: false
      },
      peso: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imagen: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      tamano: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sexo: {
        type: Sequelize.ENUM('macho', 'hembra'),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      documento: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('disponible', 'en_proceso', 'adoptado'),
        defaultValue: 'disponible',
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
    await queryInterface.dropTable('mascotas');
  }
};