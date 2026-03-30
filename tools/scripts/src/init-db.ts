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
