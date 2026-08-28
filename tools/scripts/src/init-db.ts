/*
  Initialized database

  -- force    # force to create new database file
*/

import fs from 'fs';
import Database from 'better-sqlite3';
import { DB_PATH, DB_TABLES, getTransactionBySql } from '@nm-catalog/core';

const args = process.argv.slice(2);
const isForced = args.includes('force');
const schemas = [
  DB_TABLES.lang,
  DB_TABLES.hardware,
  DB_TABLES.game,
  DB_TABLES.track,
  DB_TABLES.game_related,
  DB_TABLES.playlist,
  DB_TABLES.playlist_game,
  DB_TABLES.playlist_track,
  DB_TABLES.series,
];
const indexes = [
  `CREATE INDEX idx_game_hardware ON game(hardware)`,
  `CREATE INDEX idx_track_gid ON track(gid)`,
  `CREATE INDEX idx_track_gid_idx ON track(gid, idx)`,
  `CREATE INDEX idx_playlist_type ON playlist(type)`,
  `CREATE INDEX idx_playlist_game_pid ON playlist_game(pid)`,
  `CREATE INDEX idx_playlist_game_gid ON playlist_game(gid)`,
  `CREATE INDEX idx_playlist_track_pid_idx ON playlist_track(pid, idx)`,
];

if (isForced) {
  fs.unlinkSync(DB_PATH);
  console.warn('Delete existed database.');
}

if (!fs.existsSync(DB_PATH)) {
  console.log('No database, initializing...');

  const db = new Database(DB_PATH);
  try {
    schemas.forEach((x) => {
      db.exec(x.create());
      if (x.preparedData) {
        const trans = getTransactionBySql(x.insert(), db);
        trans(x.preparedData);
      }
    });
    db.exec('BEGIN');
    try {
      indexes.forEach((sql) => db.exec(sql));
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
    db.close();

    console.log('Database initialized!');
  } catch (error) {
    console.error(error);
    db.close();
    fs.unlinkSync(DB_PATH);
  }
} else {
  console.log('Database existed.');
}
