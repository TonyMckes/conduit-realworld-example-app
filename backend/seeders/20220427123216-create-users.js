"use strict"

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = Array(5)
      .fill(null)
      .map((_, index) => ({
        username: `exampleUser${index + 1}`,
        email: `example${index + 1}@mail.com`,
        password: `examplePwd${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      const newUser = {
          username: `auto-user`,
          email: `auto-user@mail.com`,
          password: `autoPwd`,
          createdAt: new Date(),
          updatedAt: new Date(),
      }

      const allUsers = [...users, newUser]

    await queryInterface.bulkInsert("Users", allUsers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
