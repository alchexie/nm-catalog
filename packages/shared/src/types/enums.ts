export const LangCode = {
  de_DE: 'de-DE',
  en_US: 'en-US',
  es_ES: 'es-ES',
  fr_FR: 'fr-FR',
  it_IT: 'it-IT',
  ja_JP: 'ja-JP',
  ko_KR: 'ko-KR',
  zh_CN: 'zh-CN',
  zh_TW: 'zh-TW',
} as const;
export type LangCode = keyof typeof LangCode;
export type LangCodeValue = (typeof LangCode)[keyof typeof LangCode];

export const GAME_GROUP_BY = ['PLATFORM', 'ADDED', 'RELEASE', 'SERIES'] as const;
export type GameGroupBy = (typeof GAME_GROUP_BY)[number];

export const PLAYLIST_TYPE = [
  'SINGLE_GAME_ALL',
  'BEST',
  'LOOP',
  'SINGLE_GAME',
  'MULTIPLE',
  'SPECIAL',
] as const;
export type PlaylistType = (typeof PLAYLIST_TYPE)[number];

export const PLAYLIST_SECTION_TYPE = [
  'ANNUAL',
  'SPECIAL',
  'RECOMMEND',
  'MOOD',
  'SCENE',
  'CHARACTER',
] as const;
export type PlaylistSectionType = (typeof PLAYLIST_SECTION_TYPE)[number];
