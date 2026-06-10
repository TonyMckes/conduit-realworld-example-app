"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "status", {
      type: Sequelize.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "published",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "status");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Articles_status";'
    );
  },
};
