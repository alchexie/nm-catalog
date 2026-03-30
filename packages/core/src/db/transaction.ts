import type { Statement, Transaction } from 'better-sqlite3';
import { getDb, SqliteDb } from './index.js';

type TransactionRunner = (rowsGroup: unknown[][]) => void;

export const getTransactionBySql = (
  sql: string,
  db: SqliteDb = getDb()
): Transaction<TransactionRunner> => {
  const stmt = db.prepare(sql);
  const trans = db.transaction((rowsGroup: unknown[][]) => {
    for (const rows of rowsGroup) {
      stmt.run(...rows);
    }
  });
  return trans;
};

export const getTransactionByStatement = (
  stmt: Statement,
  db: SqliteDb = getDb()
): Transaction<TransactionRunner> => {
  const trans = db.transaction((rowsGroup: unknown[][]) => {
    for (const rows of rowsGroup) {
      stmt.run(...rows);
    }
  });
  return trans;
};
