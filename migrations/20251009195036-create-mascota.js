'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mascotas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idAdopcion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Adopciones', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      idCentroAdopcion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CentroAdopciones', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      especie: {
        type: Sequelize.STRING
      },
      nombre: {
        type: Sequelize.STRING
      },
      edad: {
        type: Sequelize.STRING
      },
      imagen: {
        type: Sequelize.STRING
      },
      tamano: {
        type: Sequelize.STRING
      },
      sexo: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      documento: {
        type: Sequelize.STRING
      },
      estado: {
        type: Sequelize.STRING,
        defaultValue: 'disponible'
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
    await queryInterface.dropTable('Mascotas');
  }
};
