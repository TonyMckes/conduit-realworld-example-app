"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "title_en", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Articles", "content_en", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Articles", "summary_en", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "summary_en");
    await queryInterface.removeColumn("Articles", "content_en");
    await queryInterface.removeColumn("Articles", "title_en");
  },
};
