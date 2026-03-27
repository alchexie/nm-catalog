/*
  Initialized database
  
  -- force    # force to create new database file
*/

import fs from 'fs';
import Database from 'better-sqlite3';
import { tbGame, tbGameRelated, tbHardware, tbLang, tbTrack } from '../db/schema/index.js';
import { getTransactionBySql } from '../db/transaction.js';
import { DB_PATH } from '../utils/paths.js';

const args = process.argv.slice(2);
const isForced = args.includes('force');
const schemas = [tbLang, tbHardware, tbGame, tbTrack, tbGameRelated];

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
