import Database from 'better-sqlite3';
import { DB_PATH } from '../../utils/paths.js';
import { tbPlaylist, tbPlaylistGame, tbPlaylistTrack } from '../schema/index.js';

const update = () => {
  const db = new Database(DB_PATH);
  const sqlList = [
    tbPlaylist.create(),
    tbPlaylistGame.create(),
    tbPlaylistTrack.create(),
    `CREATE INDEX idx_game_hardware ON game(hardware)`,
    `CREATE INDEX idx_track_gid ON track(gid)`,
    `CREATE INDEX idx_track_gid_idx ON track(gid, idx)`,
    `CREATE INDEX idx_playlist_type ON playlist(type)`,
    `CREATE INDEX idx_playlist_game_pid ON playlist_game(pid)`,
    `CREATE INDEX idx_playlist_game_gid ON playlist_game(gid)`,
    `CREATE INDEX idx_playlist_track_pid_idx ON playlist_track(pid, idx)`,
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
