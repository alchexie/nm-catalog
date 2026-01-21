import { LangCode, type PlaylistType } from './enums.js';

export const DEFAULT_LANG = LangCode.en_US;

export type MultiLangField<Name extends string> = {
  [key in `${Name}_${LangCode}`]: string;
};

interface MultiLangVisualEntity extends MultiLangField<'title'>, MultiLangField<'img'> {
  id: string;
}

export interface Game extends MultiLangVisualEntity {
  year: number;
  hardware: string;
  link: string;
  inserted?: number;
}

export interface Track extends MultiLangVisualEntity {
  gid?: string;
  idx: number;
  duration: string;
  isloop: number;
  isbest: number;
}

export interface Playlist extends MultiLangVisualEntity, MultiLangField<'desc'> {
  type: PlaylistType;
  tracksnum: number;
  isrelatedgame: number;
  fetchstrategy?: string;
}

export type NMData = MultiLangVisualEntity;
