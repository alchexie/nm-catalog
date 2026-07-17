export { GAME_GROUP_BY, PLAYLIST_TYPE, PLAYLIST_SECTION_TYPE } from '@nm-catalog/shared';
export type {
  GameGroupBy,
  LangCode,
  LangCodeValue,
  PlaylistSection,
} from '@nm-catalog/shared';

export const GameDataSections = ['TRACK', 'PLAYLIST', 'RELATED'] as const;
export type GameDataSection = (typeof GameDataSections)[number];
