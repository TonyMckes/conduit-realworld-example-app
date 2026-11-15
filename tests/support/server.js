import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);

/**
 * Runs the real API for a test file, on a free port and on its own throwaway
 * SQLite database.
 *
 * To run the tests on another database instead, set the `TEST_DB_*`
 * variables of `backend/.env.example` and run the test files one at a time
 * (`npm test -- --no-file-parallelism`), as each of them empties it.
 */
export async function startTestServer() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "conduit-test-"));

  // Read by the backend when it is loaded below
  process.env.NODE_ENV = "test";
  process.env.JWT_KEY = "test-key";
  if (!process.env.TEST_DB_DIALECT) {
    process.env.TEST_DB_DIALECT = "sqlite";
    // Where SQLite keeps the database (Sequelize takes the host for it)
    process.env.TEST_DB_HOSTNAME = path.join(directory, "database.sqlite");
  }

  const db = require("../../backend/models");
  const app = require("../../backend/app");

  await db.sequelize.sync({ force: true });
  if (db.sequelize.getDialect() === "sqlite") {
    // Lets requests read while another one is writing, as other databases do
    await db.sequelize.query("PRAGMA journal_mode = WAL");
  }

  const server = await new Promise((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  const url = `http://127.0.0.1:${server.address().port}`;

  /** Calls the API, as `token`'s user when given */
  const request = async (method, endpoint, { body, token } = {}) => {
    const response = await fetch(`${url}/api${endpoint}`, {
      body: body && JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Token ${token}` }),
      },
      method,
    });

    return { status: response.status, data: await response.json() };
  };

  let users = 0;
  /** Signs up a new user: `{ username, token, headers }` */
  const signUp = async () => {
    const username = `user${++users}`;
    const { data } = await request("POST", "/users", {
      body: {
        user: { username, email: `${username}@mail.com`, password: "password" },
      },
    });
    const { token } = data.user;

    return { username, token, headers: { Authorization: `Token ${token}` } };
  };

  const close = async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.sequelize.close();
    fs.rmSync(directory, { recursive: true, force: true });
  };

  return { close, db, request, signUp, url };
}
