# express-sqlite

An SQLite-based session store for use with [express-session](https://github.com/expressjs/session), using [better-sqlite3](https://github.com/WiseLibs/better-sqlite3), with TypeScript support.

[![npm version](https://img.shields.io/npm/v/express-sqlite)](https://www.npmjs.com/package/express-sqlite)
![Last updated](https://img.shields.io/npm/last-update/express-sqlite)
[![Publish on npm](https://github.com/SBence/express-sqlite/actions/workflows/publish.yml/badge.svg)](https://github.com/SBence/express-sqlite/actions/workflows/publish.yml)
[![License](https://img.shields.io/npm/l/express-sqlite)](LICENSE)

## Table of contents

- [Usage](#usage)
- [`SQLiteStore` constructor](#sqlitestore-constructor)
- [Types](#types)
  - [`StoreOptions`](#storeoptions)
- [Sessions table structure](#sessions-table-structure)
- [Methods](#methods)

## Usage

```ts
import express from "express";
import session from "express-session";
import { SQLiteStore } from "express-sqlite";

const app = express();

// With required arguments only
const store = new SQLiteStore("sessions.db");

// With customized options
const store = new SQLiteStore("sessions.db", {
  tableName: "Sessions",
  databaseOptions: { fileMustExist: false },
  wal: true,
});

app.use(
  session({ store, secret: "your-secret-key", cookie: { secure: true } }),
);
```

## `SQLiteStore` constructor

```ts
class SQLiteStore extends Store {
  constructor(database: StoreDatabase, storeOptions?: StoreOptions) {}
}
```

| Argument       | Type                            | Default value                          | Description                                                                                                                    |
| -------------- | ------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `database`     | [`StoreDatabase`](#types)       | _Required argument_                    | The SQLite database to store sessions in. Can be specified as a file path, a `Buffer`, or a `BetterSqlite3.Database` instance. |
| `storeOptions` | [`StoreOptions`](#storeoptions) | `{ tableName: "Sessions", wal: true }` | Options for initializing the store.                                                                                            |

### `StoreOptions`

| Property          | Type               | Description                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databaseOptions` | `Database.Options` | Options passed to `better-sqlite3`'s [`Database` constructor](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options). Additionally, its `fileMustExist` property also controls whether the directory structure leading to the database file is created by this library, if it doesn't exist. |
| `tableName`       | `string`           | Name of the table to store sessions in.                                                                                                                                                                                                                                                                                            |
| `wal`             | `boolean`          | Controls the usage of SQLite's [WAL-mode](https://www.sqlite.org/wal.html).                                                                                                                                                                                                                                                        |

## Types

| Type                    | Definition                                   | Description                                                                                                                                                  |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`ErrorOnlyCallback`** | `(error?: unknown) => void`                  | Callback function with only the `error` argument. Used for store methods that don't return any data on success (`clear`, `destroy`, `set`).                  |
| **`SessionDataWithId`** | `SessionData & { id: string }`               | `express-session`'s `SessionData` type extended with an `id` field that holds the session ID. Used for the `all` method.                                     |
| **`StoreDatabase`**     | `string \| Buffer \| BetterSqlite3.Database` | A union type for the values that can be used in the [`SQLiteStore` constructor](#sqlitestore-constructor) to specify the database used for storing sessions. |

## Sessions table structure

| Column name | Data type | Constraints   |
| ----------- | --------- | ------------- |
| `id`        | `TEXT`    | `PRIMARY KEY` |
| `data`      | `TEXT`    | `NOT NULL`    |

> [!NOTE]
> If the table doesn't exist in the database, it's automatically created.

## Methods

- ```ts
  all(callback: (error: unknown, sessions?: SessionDataWithId[]) => void): void
  ```

  Retrieves all `sessions` in the store, including their IDs.

- ```ts
  destroy(sid: string, callback?: ErrorOnlyCallback): void
  ```

  Removes the session with the given ID (`sid`), if it exists. No error is thrown if there is no such session.

- ```ts
  clear(callback?: ErrorOnlyCallback): void
  ```

  Removes all sessions from the store.

- ```ts
  length(callback: (error: unknown, length?: number) => void): void
  ```

  Returns the number of active sessions (`length`).

- ```ts
  get(sid: string, callback: (error: unknown, session?: SessionData | null) => void): void
  ```

  Retrieves a `session` by its ID (`sid`). `session` is `null` if there is no such session in the store.

- ```ts
  set(sid: string, session: SessionData, callback?: ErrorOnlyCallback): void
  ```

  Saves a `session` with the given ID (`sid`). If such a session already exists, its data will be overwritten.

> [!NOTE]
> If an error occurs in any of the methods, the callback function will only have its `error` argument defined.
