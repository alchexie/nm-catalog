import type { Game, Playlist, Track } from './common.js';
import { LangCodeValue, PlaylistSectionType } from './enums.js';

export type GameGroup = (
  | { name: string; localeNameTag: never; localeNames: never }
  | { name: never; localeNameTag: string; localeNames: never }
  | { name: never; localeNameTag: never; localeNames: Record<LangCodeValue, string> }
) & { games: Game[] };

export interface GameDetail {
  game: Game;
  tracks: Track[];
  playlists: Playlist[];
  relateds: Game[];
}

export interface PlaylistSection {
  tag: PlaylistSectionType;
  playlists: Playlist[];
}

export interface PlaylistTrack extends Track {
  pidx: number;
  game?: Game;
}

export interface PlaylistTrackGroup {
  game?: Game;
  tracks: PlaylistTrack[];
}

export interface PlaylistDetail {
  playlist: Playlist;
  trackGroups: PlaylistTrackGroup[];
}
