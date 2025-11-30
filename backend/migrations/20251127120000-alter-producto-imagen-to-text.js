"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Productos", "imagen", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Productos", "imagen", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};


