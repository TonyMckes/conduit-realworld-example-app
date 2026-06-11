"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Comments", "articleId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Articles",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("Comments", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Comments", "articleId");
    await queryInterface.removeColumn("Comments", "userId");
  },
};
