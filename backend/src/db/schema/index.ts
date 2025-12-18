import tbLang from './lang.js';
import tbHardware from './hardware.js';
import tbGame from './game.js';
import tbTrack from './track.js';
import tbPlaylist from './playlist.js';
import tbPlaylistGame from './playlist_game.js';
import tbPlaylistTrack from './playlist_track.js';
import tbGameRelated from './game_related.js';

export type DataCell = string | number;
export type DataRow = Record<string, DataCell>;
export type DbSqlMethod = (...args: any[]) => string;
export type DBTableConfig = {
  create: DbSqlMethod;
  insert: DbSqlMethod;
  delete?: DbSqlMethod;
  [key: string]: DbSqlMethod | DataCell[][] | undefined;
  preparedData?: DataCell[][];
};

export {
  tbLang,
  tbHardware,
  tbGame,
  tbTrack,
  tbPlaylist,
  tbPlaylistGame,
  tbPlaylistTrack,
  tbGameRelated,
};
