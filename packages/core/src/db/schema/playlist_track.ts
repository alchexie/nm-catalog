import { DBTableConfig } from './index.js';

const tbPlaylistTrack: DBTableConfig = {
  create: () => `
    CREATE TABLE IF NOT EXISTS playlist_track (
      pid TEXT,
      idx INTEGER,
      tid TEXT,
      UNIQUE (pid, tid)
    );
  `,
  selectTrackByPid: () => `
    SELECT t.*
    FROM playlist_track pt
    INNER JOIN track t ON pt.tid = t.id
    WHERE pt.pid = ?
    ORDER BY pt.idx
  `,
  selectPlaylistByTid: () => `
    SELECT DISTINCT p.*, pg.gid, g.year
    FROM playlist_track pt
    INNER JOIN playlist p ON pt.pid = p.id
    LEFT JOIN playlist_game pg ON pg.pid = p.id AND p.type != 'MULTIPLE'
    LEFT JOIN game g ON g.id = pg.gid
    WHERE pt.tid = ?
    ORDER BY
      CASE p.type
        WHEN 'SINGLE_GAME' THEN 1
        WHEN 'MULTIPLE' THEN 2
        ELSE 99
      END,
      g.year
  `,
  selectPlaylistByTids: (tids: string[] = []) => `
    SELECT DISTINCT p.*
    FROM playlist_track pt
    INNER JOIN playlist p ON pt.pid = p.id
    WHERE pt.tid in (${tids.map((id) => `'${id}'`).join(',')})
  `,
  insert: () => `INSERT OR IGNORE INTO playlist_track (pid, idx, tid) VALUES (?, ?, ?)`,
  deleteByPid: () => `DELETE FROM playlist_track WHERE pid = ?`,
};

export default tbPlaylistTrack;
