import { SQLiteStore } from "@src/index.js";
import { StoreDatabase, StoreOptions } from "@src/types.js";
import express from "express";
import session from "express-session";
import { ENDPOINT_CREATE, ENDPOINT_DATA, ENDPOINT_DESTROY } from "../config.js";

export default (database: StoreDatabase, storeOptions?: StoreOptions) => {
  const app = express();
  const store = new SQLiteStore(database, storeOptions);

  app.use(
    session({
      secret: "test",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
      store,
    }),
  );

  app.get(ENDPOINT_CREATE, (req, res) => {
    const testData = req.query.data;
    if (typeof testData !== "string") {
      res.send();
    } else {
      req.session.test = testData;
      res.send(testData);
    }
  });

  app.get(ENDPOINT_DATA, (req, res) => {
    if (!req.session.test) {
      res.status(400).send();
      return;
    }
    res.send(req.session.test);
  });

  app.get(ENDPOINT_DESTROY, (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error logging out");
      } else {
        res.send("Logged out");
      }
    });
  });

  return { app, store };
};
