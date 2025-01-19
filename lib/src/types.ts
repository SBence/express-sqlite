import Database from "better-sqlite3";
import { SessionData } from "express-session";

export type ErrorOnlyCallback = (error?: unknown) => void;

export interface SessionDataWithId extends SessionData {
  id: string;
}

export interface SessionRecord {
  id: string;
  data: string;
}

export type StoreDatabase = string | Buffer | Database.Database;

export interface StoreOptions {
  databaseOptions?: Database.Options;
  tableName?: string;
  wal?: boolean;
}
