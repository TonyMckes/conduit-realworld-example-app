"use strict"
const { User } = require("../models")

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await User.findAll()
        const article = {
            slug: `Autotest-slug`,
            title: `Autotest-title`,
            description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
            body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec ante lacinia magna ultricies cursus nec non lacus. Praesent blandit sodales semper. Mauris eget leo non erat molestie faucibus luctus sed ex. Duis sollicitudin tellus vitae aliquam cursus. Integer ultricies ultricies erat. Vivamus egestas ac augue nec mattis. Duis posuere bibendum ex vitae placerat. Duis in odio vestibulum, pellentesque odio vitae, egestas nibh.`,
            userId: users[Math.floor(Math.random() * users.length)].id,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await queryInterface.bulkInsert("Articles", [article], {})
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Articles", null, {})
    },
}
