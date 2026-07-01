require("dotenv").config();

/** @type {import('sequelize').Options} */
module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    dialect: process.env.DEV_DB_DIALECT,
    storage: process.env.DEV_DB_STORAGE,
    logging: process.env.DEV_DB_LOGGING === "true",
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOSTNAME,
    dialect: process.env.TEST_DB_DIALECT,
    storage: process.env.TEST_DB_STORAGE,
    logging: process.env.TEST_DB_LOGGING === "true",
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    dialect: process.env.PROD_DB_DIALECT,
    storage: process.env.PROD_DB_STORAGE,
    logging: process.env.PROD_DB_LOGGING === "true",
  },
};
