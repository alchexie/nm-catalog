import Database from 'better-sqlite3';
import { DB_PATH } from '../../utils/paths.js';
import { DB_TABLES } from '../schema/index.js';

const update = () => {
  const db = new Database(DB_PATH);
  const sqlList = [
    DB_TABLES.series.create(),
    `ALTER TABLE game ADD COLUMN sid TEXT`
  ];
  const trans = db.transaction(() => {
    for (const sql of sqlList) {
      db.exec(sql);
    }
  });
  trans();
  db.close();
};

export default update;
