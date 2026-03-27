import { getDb, SqliteDb } from './index.js';
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
} from './schema/index.js';

const prepare = (db: SqliteDb, tbConfig: DBTableConfig) => {
  return Object.fromEntries(
    (
      Object.entries(tbConfig).filter(
        ([key, value]) =>
          key !== 'create' && key !== 'preparedData' && typeof value === 'function'
      ) as [string, DbSqlMethod][]
    ).map(([key, fn]) => [key, (...args: any[]) => db.prepare(fn(...args))])
  );
};

const db = getDb();
export const stmt = {
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
