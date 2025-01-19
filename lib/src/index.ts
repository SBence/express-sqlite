import Database from "better-sqlite3";
import { SessionData, Store } from "express-session";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import {
  ErrorOnlyCallback,
  SessionDataWithId,
  SessionRecord,
  StoreDatabase,
  StoreOptions,
} from "./types.js";

const COLUMN_ID = "id";
const COLUMN_DATA = "data";

function noop(): void {
  return;
}

export class SQLiteStore extends Store {
  private readonly db: Database.Database;
  public readonly tableName: string;

  constructor(
    database: StoreDatabase,
    { databaseOptions, tableName = "Sessions", wal = true }: StoreOptions = {},
  ) {
    super();

    this.tableName = tableName;

    if (typeof database === "string") {
      const databaseFolder = dirname(database);

      if (!existsSync(databaseFolder)) {
        if (databaseOptions?.fileMustExist) {
          throw new Error("Database directory does not exist");
        } else {
          mkdirSync(databaseFolder, { recursive: true });
        }
      }
    }

    if (database instanceof Database) {
      this.db = database;
    } else {
      this.db = new Database(database, databaseOptions);
      if (wal) this.db.pragma("journal_mode = WAL");
    }

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS "${this.tableName}" ("${COLUMN_ID}" TEXT PRIMARY KEY, "${COLUMN_DATA}" TEXT NOT NULL)`,
      )
      .run();
  }

  destroy(sid: string, callback: ErrorOnlyCallback = noop): void {
    try {
      this.db
        .prepare(`DELETE FROM "${this.tableName}" WHERE "${COLUMN_ID}" = @sid`)
        .run({ sid });
    } catch (error) {
      callback(error);
      return;
    }
    callback();
  }

  clear(callback: ErrorOnlyCallback = noop): void {
    try {
      this.db.prepare(`DELETE FROM "${this.tableName}"`).run();
    } catch (error) {
      callback(error);
      return;
    }
    callback();
  }

  length(callback: (error: unknown, length?: number) => void): void {
    let count: number | undefined;
    try {
      count = (
        this.db
          .prepare(`SELECT COUNT(*) AS "count" FROM "${this.tableName}"`)
          .get() as { count: number } | undefined
      )?.count;
      if (count === undefined) throw new Error("Failed to get session count");
    } catch (error) {
      callback(error);
      return;
    }
    callback(undefined, count);
  }

  get(
    sid: string,
    callback: (error: unknown, session?: SessionData | null) => void,
  ): void {
    let row: string | undefined;
    try {
      row = (
        this.db
          .prepare(
            `SELECT "${COLUMN_DATA}" FROM "${this.tableName}" WHERE "${COLUMN_ID}" = @sid`,
          )
          .get({ sid }) as { data: string } | undefined
      )?.data;
    } catch (error) {
      callback(error);
      return;
    }
    callback(undefined, row ? (JSON.parse(row) as SessionData) : null);
  }

  set(
    sid: string,
    session: SessionData,
    callback: ErrorOnlyCallback = noop,
  ): void {
    try {
      this.db
        .prepare(
          `INSERT INTO "${this.tableName}" ("${COLUMN_ID}", "${COLUMN_DATA}") VALUES (@sid, @data) ON CONFLICT ("${COLUMN_ID}") DO UPDATE SET "${COLUMN_DATA}" = excluded."${COLUMN_DATA}"`,
        )
        .run({ sid, data: JSON.stringify(session) });
    } catch (error) {
      callback(error);
      return;
    }
    callback();
  }

  all(
    callback: (error: unknown, sessions?: SessionDataWithId[]) => void,
  ): void {
    let sessions: SessionRecord[];
    try {
      sessions = this.db
        .prepare(`SELECT * FROM "${this.tableName}"`)
        .all() as SessionRecord[];
    } catch (error) {
      callback(error);
      return;
    }
    callback(
      undefined,
      sessions.map((session) => ({
        ...(JSON.parse(session.data) as SessionData),
        id: session.id,
      })),
    );
  }
}
