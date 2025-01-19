import { SQLiteStore } from "@src/index.js";
import { existsSync, rmSync } from "fs";
import { join } from "path";
import { afterAll, expect, test } from "vitest";
import { TEST_ARTIFACTS_FOLDER, TEST_CLIENT_COUNT } from "./config.js";
import expectLength from "./utils/expectLength.js";
import getTestServer from "./utils/getTestServer.js";
import loginGenerator from "./utils/loginGenerator.js";
import provideEnvironment from "./utils/provideEnvironment.js";
import shortUUID from "./utils/shortUUID.js";

afterAll(() => {
  rmSync(TEST_ARTIFACTS_FOLDER, { recursive: true });
});

test("Store should return null for nonexistent session ID queries", () => {
  const database = join(TEST_ARTIFACTS_FOLDER, `${shortUUID()}.db`);
  const store = new SQLiteStore(database);

  for (let index = 0; index < TEST_CLIENT_COUNT; index++) {
    const sidShouldNotExist = shortUUID();
    store.get(sidShouldNotExist, (error, session) => {
      expect(error).toBeUndefined();
      expect(session).toBeNull();
    });
  }
});

test("Don't create folder if fileMustExist is true", () => {
  const dbFolderShouldNotExist = join(TEST_ARTIFACTS_FOLDER, shortUUID());
  const database = join(dbFolderShouldNotExist, `${shortUUID()}.db`);

  expect(() => {
    getTestServer(database, {
      databaseOptions: { fileMustExist: true },
    });
  }).toThrowError();

  const testFolderExists = existsSync(dbFolderShouldNotExist);
  expect(testFolderExists).toBe(false);
});

test("Save sessions with data on login", async () => {
  await provideEnvironment(async ({ app, store }) => {
    const testDatas = await loginGenerator(app, { withData: true });

    expectLength(store, TEST_CLIENT_COUNT);

    store.all((error, sessions) => {
      expect(error).toBeUndefined();
      const everyTestData = sessions?.map((session) => session.test);
      const hasAll = testDatas.every((testData) =>
        everyTestData?.includes(testData),
      );
      expect(hasAll).toBe(true);
    });
  });
});

test("Save sessions without data on login", async () => {
  await provideEnvironment(async ({ app, store }) => {
    await loginGenerator(app, { withData: false });
    expectLength(store, TEST_CLIENT_COUNT);
  });
});

test("Destroy session on logout", async () => {
  await provideEnvironment(async ({ app, store }) => {
    await loginGenerator(app, { logout: true, withData: true });
    expectLength(store, 0);
  });
});

test("Clear all sessions", async () => {
  await provideEnvironment(async ({ app, store }) => {
    await loginGenerator(app, { withData: true });
    store.clear((error) => {
      expect(error).toBeUndefined();
    });
    expectLength(store, 0);
  });
});
