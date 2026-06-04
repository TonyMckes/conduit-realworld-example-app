const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const sqlJsSqlite3 = require("../lib/sqljs-sqlite3");

const parseLogging = (value) => {
  if (value === undefined) return false;
  if (value === "true") return console.log;
  return value === true;
};

const resolveStorage = (storage) => {
  if (!storage) return storage;
  return path.isAbsolute(storage) ? storage : path.resolve(__dirname, "..", storage);
};

const buildConfig = (prefix, defaults) => {
  const dialect = process.env[`${prefix}_DB_DIALECT`] || defaults.dialect;
  const config = {
    username: process.env[`${prefix}_DB_USERNAME`] || defaults.username,
    password: process.env[`${prefix}_DB_PASSWORD`] || defaults.password,
    database: process.env[`${prefix}_DB_NAME`] || defaults.database,
    host: process.env[`${prefix}_DB_HOSTNAME`] || defaults.host,
    dialect,
    logging: parseLogging(
      process.env[`${prefix}_DB_LOGGING`] || process.env[`${prefix}_DB_LOGGGIN`],
    ),
  };

  if (dialect === "sqlite") {
    config.storage = resolveStorage(
      process.env[`${prefix}_DB_STORAGE`] || defaults.storage,
    );
    config.dialectModule = sqlJsSqlite3;
  }

  return config;
};

/** @type {Record<string, import('sequelize').Options>} */
module.exports = {
  development: buildConfig("DEV", {
    username: null,
    password: null,
    database: "conduit_development",
    host: undefined,
    dialect: "sqlite",
    storage: path.resolve(__dirname, "..", "storage", "dev.sqlite"),
  }),
  test: buildConfig("TEST", {
    username: null,
    password: null,
    database: "conduit_test",
    host: undefined,
    dialect: "sqlite",
    storage: path.resolve(__dirname, "..", "storage", "test.sqlite"),
  }),
  production: buildConfig("PROD", {
    username: undefined,
    password: undefined,
    database: undefined,
    host: undefined,
    dialect: "postgres",
    storage: undefined,
  }),
};
