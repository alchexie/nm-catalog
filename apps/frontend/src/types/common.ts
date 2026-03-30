import type { LangCodeValue } from '@nm-catalog/shared';

export { DEFAULT_LANG, LangCode } from '@nm-catalog/shared';
export type { MultiLangField, Game, Track, Playlist, NMData } from '@nm-catalog/shared';

export const MAIN_TITLE = 'Nintendo Music Catalog';
export const STORAGE_KEY = {
  FIRST: 'FIRST',
  LOCALE: 'LOCALE',
  LANG: 'LANG',
  GAME_GROUPBY: 'GAME_GROUPBY',
};

export interface DurationInfo {
  hour: number;
  minute: number;
  second: number;
}

export const LangNameMap: Record<LangCodeValue, string> = {
  'de-DE': 'Deutsch',
  'en-US': 'English',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'it-IT': 'Italiano',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
} as const;
