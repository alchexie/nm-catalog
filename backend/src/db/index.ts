import Database from 'better-sqlite3';
import { DB_PATH } from '../utils/paths.js';

export type SqliteDb = InstanceType<typeof Database>;

let db: SqliteDb | undefined;

export const getDb = (): SqliteDb => {
  if (!db) {
    db = new Database(DB_PATH);
  }
  return db;
};

export const closeDb = () => {
  db?.close();
  db = undefined;
};
