export {
  GameGroupBy,
  LangCode,
  PlaylistType,
  PlaylistSectionType,
} from '@nm-catalog/shared';
export type { LangCodeValue, PlaylistSection } from '@nm-catalog/shared';

export const GameDataSections = ['TRACK', 'PLAYLIST', 'RELATED'] as const;
export type GameDataSection = (typeof GameDataSections)[number];
