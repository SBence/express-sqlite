import { SQLiteStore } from "@src/index.js";
import { expect } from "vitest";

export default (store: SQLiteStore, length: number) => {
  store.length((error, len) => {
    expect(error).toBeUndefined();
    expect(len).toBe(length);
  });
};
