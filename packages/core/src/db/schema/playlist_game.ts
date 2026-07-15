import { DBTableConfig } from './index.js';

const tbPlaylistGame: DBTableConfig = {
  create: () => `
    CREATE TABLE IF NOT EXISTS playlist_game (
        pid TEXT,
        gid TEXT,
        UNIQUE (pid, gid)
      );
  `,
  selectGameByPid: () => `
    SELECT g.*
    FROM playlist_game pg
    INNER JOIN game g ON pg.gid = g.id
    WHERE pg.pid = ?
  `,
  insert: () => {
    return `
      INSERT INTO playlist_game (
        pid, gid, sort
      )
      VALUES (?, ?, ?)
      ON CONFLICT(pid, gid) DO
      UPDATE SET
        sort=excluded.sort
      WHERE excluded.sort != -1
    `;
  },
  delete: () => `DELETE FROM playlist_game`,
  deleteByGid: () => `DELETE FROM playlist_game WHERE gid = ?`,
};

export default tbPlaylistGame;
