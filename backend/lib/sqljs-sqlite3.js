const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

let sqlJsPromise;

class Statement {
  constructor({ lastID = 0, changes = 0 } = {}) {
    this.lastID = lastID;
    this.changes = changes;
  }
}

const normalizeArgs = (params, callback) => {
  if (typeof params === "function") {
    return { params: [], callback: params };
  }

  return { params: params || [], callback };
};

const normalizeValue = (value) => {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return new Uint8Array(value);
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
};

const normalizeParams = (params) => {
  if (Array.isArray(params)) return params.map(normalizeValue);
  if (params && typeof params === "object") {
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, normalizeValue(value)]),
    );
  }

  return [];
};

const toRows = (resultSet) => {
  if (!resultSet) return [];

  return resultSet.values.map((values) =>
    Object.fromEntries(
      resultSet.columns.map((column, index) => [column, values[index]]),
    ),
  );
};

const toSqliteError = (error) => {
  const sqliteError = new Error(`SQLITE_ERROR: ${error.message}`);
  sqliteError.code = "SQLITE_ERROR";

  if (error.message.includes("constraint failed")) {
    sqliteError.code = "SQLITE_CONSTRAINT";
    sqliteError.message = `SQLITE_CONSTRAINT: ${error.message}`;
  }

  return sqliteError;
};

const loadSqlJs = () => {
  if (!sqlJsPromise) sqlJsPromise = initSqlJs();
  return sqlJsPromise;
};

class Database {
  constructor(filename, mode, callback) {
    this.filename = filename || ":memory:";
    this.inMemory = this.filename === ":memory:";
    this.closed = false;

    this.ready = loadSqlJs()
      .then((SQL) => {
        const fileBuffer =
          !this.inMemory && fs.existsSync(this.filename)
            ? fs.readFileSync(this.filename)
            : undefined;

        this.db = new SQL.Database(fileBuffer);
        callback?.(null);
      })
      .catch((error) => callback?.(toSqliteError(error)));
  }

  serialize(callback) {
    callback();
  }

  parallelize(callback) {
    callback?.();
  }

  configure() {}

  run(sql, params, callback) {
    const args = normalizeArgs(params, callback);

    this.ready
      .then(() => {
        this.db.run(sql, normalizeParams(args.params));
        const changes = this.db.getRowsModified();
        const lastID = this.getLastInsertId();
        this.persist();
        args.callback?.call(new Statement({ lastID, changes }), null);
      })
      .catch((error) => args.callback?.call(new Statement(), toSqliteError(error)));

    return this;
  }

  all(sql, params, callback) {
    const args = normalizeArgs(params, callback);

    this.ready
      .then(() => {
        const results = this.db.exec(sql, normalizeParams(args.params));
        args.callback?.call(new Statement(), null, toRows(results[0]));
      })
      .catch((error) => args.callback?.call(new Statement(), toSqliteError(error)));

    return this;
  }

  get(sql, params, callback) {
    const args = normalizeArgs(params, callback);

    return this.all(sql, args.params, function handleRows(error, rows) {
      args.callback?.call(this, error, rows?.[0]);
    });
  }

  exec(sql, callback) {
    this.ready
      .then(() => {
        this.db.exec(sql);
        this.persist();
        callback?.(null);
      })
      .catch((error) => callback?.(toSqliteError(error)));

    return this;
  }

  close(callback) {
    this.ready
      .then(() => {
        this.persist();
        this.db.close();
        this.closed = true;
        callback?.(null);
      })
      .catch((error) => callback?.(toSqliteError(error)));
  }

  getLastInsertId() {
    const result = this.db.exec("SELECT last_insert_rowid() AS id");
    return result[0]?.values?.[0]?.[0] || 0;
  }

  persist() {
    if (this.inMemory || this.closed) return;

    fs.mkdirSync(path.dirname(this.filename), { recursive: true });
    fs.writeFileSync(this.filename, Buffer.from(this.db.export()));
  }
}

module.exports = {
  Database,
  OPEN_READONLY: 0x00000001,
  OPEN_READWRITE: 0x00000002,
  OPEN_CREATE: 0x00000004,
};
