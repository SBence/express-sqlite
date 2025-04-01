import { SQLiteStore } from "@src/index.js";
import Database from "better-sqlite3";
import { existsSync } from "fs";
import { join } from "path";
import { App } from "supertest/types.js";
import { expect } from "vitest";
import { TEST_ARTIFACTS_FOLDER } from "../config.js";
import getTestServer from "./getTestServer.js";
import shortUUID from "./shortUUID.js";

function walFilesPresent(databasePath: string) {
  const shmFilePresent = existsSync(`${databasePath}-shm`);
  const walFilePresent = existsSync(`${databasePath}-wal`);

  return shmFilePresent || walFilePresent;
}

export default async (
  testFunction: ({
    app,
    store,
  }: {
    app: App;
    store: SQLiteStore;
  }) => Promise<void>,
) => {
  // Generate database paths
  const dbPathWal = join(TEST_ARTIFACTS_FOLDER, `${shortUUID()}.db`);
  const dbPathNoWal = join(TEST_ARTIFACTS_FOLDER, `${shortUUID()}.db`);
  const dbPathForConstructorWal = join(
    TEST_ARTIFACTS_FOLDER,
    `${shortUUID()}.db`,
  );
  const dbPathForConstructorNoWal = join(
    TEST_ARTIFACTS_FOLDER,
    `${shortUUID()}.db`,
  );

  // Generate stores
  const { app: appWithDbPathWal, store: storeWithDbPathWal } =
    getTestServer(dbPathWal);

  const { app: appWithDbPathNoWal, store: storeWithDbPathNoWal } =
    getTestServer(dbPathNoWal, { wal: false });

  const databaseInstanceWal = new Database(dbPathForConstructorWal);
  databaseInstanceWal.pragma("journal_mode = WAL");
  const { app: appWithDbInstanceWal, store: storeWithDbInstanceWal } =
    getTestServer(databaseInstanceWal);

  const databaseInstanceNoWal = new Database(dbPathForConstructorNoWal);
  const { app: appWithDbInstanceNoWal, store: storeWithDbInstanceNoWal } =
    getTestServer(databaseInstanceNoWal);

  // Check if wal argument is respected
  expect(walFilesPresent(dbPathWal)).toBe(true);
  expect(walFilesPresent(dbPathNoWal)).toBe(false);
  expect(walFilesPresent(dbPathForConstructorWal)).toBe(true);
  expect(walFilesPresent(dbPathForConstructorNoWal)).toBe(false);

  // Run tests
  await testFunction({ app: appWithDbPathWal, store: storeWithDbPathWal });
  await testFunction({
    app: appWithDbInstanceWal,
    store: storeWithDbInstanceWal,
  });
  await testFunction({ app: appWithDbPathNoWal, store: storeWithDbPathNoWal });
  await testFunction({
    app: appWithDbInstanceNoWal,
    store: storeWithDbInstanceNoWal,
  });
};
