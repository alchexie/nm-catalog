import Database from 'better-sqlite3';
import { DB_PATH } from '../../utils/paths.js';

const update = () => {
  const db = new Database(DB_PATH);
  const sqlList = [
    `ALTER TABLE playlist ADD COLUMN fetchstrategy TEXT`,
    `UPDATE playlist SET fetchstrategy='SELECT * FROM track WHERE isbest = 1' WHERE ID='46445c4a-7fba-403c-90b9-5f1d39be404f'`,
    `DELETE FROM playlist_track WHERE pid = '46445c4a-7fba-403c-90b9-5f1d39be404f'`
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
