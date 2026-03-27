import { Statement } from 'better-sqlite3';
import { getDb, SqliteDb } from './index.js';

export const getTransactionBySql = (sql: string, db: SqliteDb = getDb()) => {
  const stmt = db.prepare(sql);
  const trans = db.transaction((rowsGroup: unknown[][]) => {
    for (const rows of rowsGroup) {
      stmt.run(...rows);
    }
  });
  return trans;
};

export const getTransactionByStatement = (stmt: Statement, db: SqliteDb = getDb()) => {
  const trans = db.transaction((rowsGroup: unknown[][]) => {
    for (const rows of rowsGroup) {
      stmt.run(...rows);
    }
  });
  return trans;
};
