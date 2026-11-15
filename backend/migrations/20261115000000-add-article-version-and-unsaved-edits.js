"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    // The server also syncs the models on start up, so only add what's missing
    const articles = await queryInterface.describeTable("Articles");
    if (!articles.version) {
      await queryInterface.addColumn("Articles", "version", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      });
    }

    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((table) => table.tableName || table);
    if (tableNames.includes("UnsavedEdits")) return;

    await queryInterface.createTable("UnsavedEdits", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      articleId: {
        type: Sequelize.INTEGER,
        references: { model: "Articles", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      title: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      body: {
        type: Sequelize.TEXT,
      },
      tagList: {
        type: Sequelize.TEXT,
      },
      baseVersion: {
        type: Sequelize.INTEGER,
      },
      baseTitle: {
        type: Sequelize.TEXT,
      },
      baseDescription: {
        type: Sequelize.TEXT,
      },
      baseBody: {
        type: Sequelize.TEXT,
      },
      baseTagList: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UnsavedEdits");
    await queryInterface.removeColumn("Articles", "version");
  },
};
