import type { Statement as SqliteStatement } from 'better-sqlite3';
import { getDb, SqliteDb } from './index.js';
import { DBTableConfig, DB_TABLES, DbSqlMethod } from './schema/index.js';

type TableName = keyof typeof DB_TABLES;
type PreparedTable = Record<string, (...args: any[]) => SqliteStatement>;

type StatementMap = {
  [key in TableName]: PreparedTable;
} & {
  sql: (sql: string) => SqliteStatement;
};

const prepare = (db: SqliteDb, tbConfig: DBTableConfig): PreparedTable => {
  return Object.fromEntries(
    (
      Object.entries(tbConfig).filter(
        ([key, value]) =>
          key !== 'create' && key !== 'preparedData' && typeof value === 'function'
      ) as [string, DbSqlMethod][]
    ).map(([key, fn]) => [key, (...args: any[]) => db.prepare(fn(...args))])
  ) as PreparedTable;
};

const createStatementMap = (): StatementMap => {
  const db = getDb();
  return {
    ...Object.fromEntries(
      Object.entries(DB_TABLES).map(([tbName, tbConfig]) => [
        tbName,
        prepare(db, tbConfig),
      ])
    ),
    sql: (sql: string) => db.prepare(sql),
  } as StatementMap;
};

let cachedStmt: StatementMap | undefined;
const getStatementMap = (): StatementMap => cachedStmt ?? createStatementMap();

export const stmt: StatementMap = new Proxy({} as StatementMap, {
  get(_target, prop, receiver) {
    const map = getStatementMap();
    return Reflect.get(map, prop, receiver);
  },
  ownKeys() {
    return Reflect.ownKeys(getStatementMap());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(getStatementMap(), prop);
  },
});
