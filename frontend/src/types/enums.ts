export const GameGroupBy = {
  PLATFORM: 'Group by Platform',
  RELEASE: 'Group by Release Year',
  ADDED: 'Sort by Latest',
} as const;
export type GameGroupBy = keyof typeof GameGroupBy;

export const GameDataSection = {
  TRACK: 'Tracks',
  PLAYLIST: 'Playlists',
  RELATED: 'Related Games',
};
export type GameDataSection = keyof typeof GameDataSection;

export const PlaylistType = {
  SINGLE_GAME_ALL: 'SINGLE_GAME_ALL',
  BEST: 'BEST',
  LOOP: 'LOOP',
  SINGLE_GAME: 'SINGLE_GAME',
  MULTIPLE: 'MULTIPLE',
  SPECIAL: 'SPECIAL',
};
export type PlaylistType = keyof typeof PlaylistType;

export const TrackMode = {
  ALL: 'All',
  TOP: 'Top',
  LOOP: 'Extendable',
};
export type TrackMode = keyof typeof TrackMode;

export const LangCode = {
  DE_DE: 'de_DE',
  EN_US: 'en_US',
  ES_ES: 'es_ES',
  FR_FR: 'fr_FR',
  IT_IT: 'it_IT',
  JA_JP: 'ja_JP',
  KO_KR: 'ko_KR',
  ZH_CN: 'zh_CN',
  ZH_TW: 'zh_TW',
};
export type LangCode = keyof typeof LangCode;