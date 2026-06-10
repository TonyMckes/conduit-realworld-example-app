"use strict";

const { User } = require("../models");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await User.findAll();

    const articles = Array(55)
      .fill(null)
      .map((_, index) => ({
        slug: `lorem-ipsum-${index + 1}`,
        title: `Lorem Ipsum ${index + 1}`,
        description: `${
          index + 1
        } - Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec ante lacinia magna ultricies cursus nec non lacus. Praesent blandit sodales semper. Mauris eget leo non erat molestie faucibus luctus sed ex. Duis sollicitudin tellus vitae aliquam cursus. Integer ultricies ultricies erat. Vivamus egestas ac augue nec mattis. Duis posuere bibendum ex vitae placerat. Duis in odio vestibulum, pellentesque odio vitae, egestas nibh.`,
        userId: users[Math.floor(Math.random() * users.length)].id,
        language: "zh",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    await queryInterface.bulkInsert("Articles", articles, {});

    // Add English versions for the first 3 articles
    const zhArticles = await queryInterface.sequelize.query(
      `SELECT id, slug FROM "Articles" WHERE language = 'zh' ORDER BY id LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const enArticles = zhArticles.map((zh, index) => ({
      slug: `lorem-ipsum-en-${index + 1}`,
      title: `Lorem Ipsum EN ${index + 1}`,
      description: `${index + 1} - This is the English version of the article.`,
      body: `This is the English version of Lorem Ipsum ${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec ante lacinia magna ultricies cursus nec non lacus. Praesent blandit sodales semper. Mauris eget leo non erat molestie faucibus luctus sed ex.`,
      userId: users[Math.floor(Math.random() * users.length)].id,
      language: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("Articles", enArticles, {});

    // Link the Chinese articles to their English versions
    const enArticlesInserted = await queryInterface.sequelize.query(
      `SELECT id, slug FROM "Articles" WHERE language = 'en' ORDER BY id LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    for (let i = 0; i < zhArticles.length; i++) {
      await queryInterface.sequelize.query(
        `UPDATE "Articles" SET "relatedArticleId" = ${enArticlesInserted[i].id} WHERE id = ${zhArticles[i].id}`,
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Articles", null, {});
  },
};
