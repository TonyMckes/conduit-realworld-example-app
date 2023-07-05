"use strict"
const bcrypt = require('bcrypt')

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await Promise.all(
            Array(5)
                .fill(null)
                .map(async (_, index) => ({
                    username: `exampleUser${index + 1}`,
                    email: `example${index + 1}@mail.com`,
                    password: await bcrypt.hash(`examplePwd${index + 1}`, 10),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }))
        );

        const newUser = {
            username: `auto-user`,
            email: `auto-user@mail.com`,
            password: await bcrypt.hash(`autoPwd`, 10),
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const allUsers = [...users, newUser]

        await queryInterface.bulkInsert("Users", allUsers, {})
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Users", null, {})
    },
}


