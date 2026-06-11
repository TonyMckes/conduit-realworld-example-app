"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "language", {
      type: Sequelize.STRING,
      defaultValue: "zh",
      allowNull: false,
    });

    await queryInterface.addColumn("Articles", "relatedArticleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Articles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "relatedArticleId");
    await queryInterface.removeColumn("Articles", "language");
  },
};
