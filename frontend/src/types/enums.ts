export const GameGroupBy = {
  PLATFORM: 'Group by Platform',
  RELEASE: 'Group by Release Year',
  ADDED: 'Sort by Latest',
} as const;
export type GameGroupBy = keyof typeof GameGroupBy;

export const GameDataSection = {
  TRACK: 'Tracks',
  RELATED: 'Related Games',
  // PLAYLIST: 'Playlists',
};
export type GameDataSection = keyof typeof GameDataSection;

export const TrackMode = {
  ALL: 'All',
  TOP: 'Top',
  LOOP: 'Extendable',
};
export type TrackMode = keyof typeof TrackMode;
