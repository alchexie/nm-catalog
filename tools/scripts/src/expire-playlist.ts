/*
  Expired data of playlists from Playlist Section data
  
  -- no-exec       # only fetch data and not to operate database
*/

import {
  COMMON_PATHS,
  DataRow,
  getTransactionBySql,
  info,
  readText,
} from '@nm-catalog/core';

const args = process.argv.slice(2);
const isNoExec = args.includes('no-exec');

(async () => {
  try {
    const sections = JSON.parse(readText(COMMON_PATHS['res_playlist_section.json']));
    const playlists = (<DataRow[][]>Object.values(sections)).reduce((a, b) => [
      ...a,
      ...b,
    ]);

    const playlistData = playlists.map((p: DataRow) => [p.expired ? 1 : 0, p.id]);
    if (!isNoExec) {
      const trans = getTransactionBySql('UPDATE playlist SET isexpired = ? WHERE id = ?');
      trans(playlistData);
    }
    info(`Expired playlist data has been modified.`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
