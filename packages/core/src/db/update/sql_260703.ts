import Database from 'better-sqlite3';
import { DB_PATH } from '../../utils/paths.js';

const update = () => {
  const db = new Database(DB_PATH);
  db.exec(`ALTER TABLE playlist_game ADD COLUMN sort INTEGER`);
  db.close();
};

export default update;
