import { DB_PATH } from "@nm-catalog/core";
import Database from "better-sqlite3";

  const db = new Database(DB_PATH);
  db.exec('vacuum');
