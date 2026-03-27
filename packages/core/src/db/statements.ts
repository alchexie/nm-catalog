import { getDb, SqliteDb } from './index.js';
import type { Statement as SqliteStatement } from 'better-sqlite3';
import {
  DBTableConfig,
  DbSqlMethod,
  tbGameRelated,
  tbGame,
  tbHardware,
  tbLang,
  tbPlaylistGame,
  tbPlaylist,
  tbPlaylistTrack,
  tbTrack,
  TableName,
} from './schema/index.js';

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

const db = getDb();
export const stmt: StatementMap = {
  lang: prepare(db, tbLang),
  hardware: prepare(db, tbHardware),
  game: prepare(db, tbGame),
  track: prepare(db, tbTrack),
  playlist: prepare(db, tbPlaylist),
  playlist_game: prepare(db, tbPlaylistGame),
  playlist_track: prepare(db, tbPlaylistTrack),
  game_related: prepare(db, tbGameRelated),
  sql: (sql: string) => db.prepare(sql),
};
