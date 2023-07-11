"use strict"
const bcrypt = require('bcrypt')

module.exports = {
    async up(queryInterface, Sequelize) {
        const user = {
            username: `auto-user`,
            email: `auto-user@mail.com`,
            password: await bcrypt.hash(`auto-pass`, 10),
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await queryInterface.bulkInsert("Users", [user], {})
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Users", null, {})
    },
}
