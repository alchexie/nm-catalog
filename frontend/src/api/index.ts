import type { GameDetail, GameGroup, PlaylistDetail } from '@/types';
import type { PlaylistSection } from '@nm-catalog/shared';

const call = async (url: string): Promise<any> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  }
  return await res.json();
};

export const getGames = (
  groupby: 'hardware' | 'release' | 'recent'
): Promise<GameGroup[]> => {
  return call(`/api/game/${groupby}`);
};

export const getGameDetail = (gid: string): Promise<GameDetail> => {
  return call(`/api/game/${gid}/detail`);
};

export const getPlaylistSections = (): Promise<PlaylistSection[]> => {
  return call(`/api/playlist`);
};

export const getPlaylistDetail = (pid: string): Promise<PlaylistDetail> => {
  return call(`/api/playlist/${pid}/detail`);
};
