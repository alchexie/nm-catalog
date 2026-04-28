import Database from 'better-sqlite3';
import { DB_PATH } from '../../utils/paths.js';

const update = () => {
  const db = new Database(DB_PATH);
  const sqlList = [
    `ALTER TABLE playlist ADD COLUMN isexpired INTEGER`,
    'UPDATE playlist SET isexpired = 0',
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
