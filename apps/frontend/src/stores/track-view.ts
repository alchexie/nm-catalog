import { defineStore } from 'pinia';
import { STORAGE_KEY, TrackViewModes, type TrackViewMode } from '@/types';
import type { PlaylistTrack, Track } from '@nm-catalog/shared';

export const useTrackViewStore = defineStore('trackView', {
  state: () => ({
    viewMode: (() => {
      const cached = localStorage.getItem(STORAGE_KEY.TRACK_VIEW_MODE);
      return TrackViewModes.includes(cached as TrackViewMode)
        ? (cached as TrackViewMode)
        : 'detail';
    })(),
    isShowGame: (() => {
      const cached = localStorage.getItem(STORAGE_KEY.TRACK_SHOW_GROUP);
      return cached === null ? true : cached === 'true';
    })(),
    menuTrack: null as Track | PlaylistTrack | null,
    activeTrack: null as Track | PlaylistTrack | null,
  }),
  actions: {
    setViewMode(viewMode: TrackViewMode) {
      this.viewMode = viewMode;
      localStorage.setItem(STORAGE_KEY.TRACK_VIEW_MODE, viewMode);
    },
    setIsShowGroup(isShowGame: boolean) {
      this.isShowGame = isShowGame;
      localStorage.setItem(STORAGE_KEY.TRACK_SHOW_GROUP, String(isShowGame));
    },
    setMenuTrack(track: Track | PlaylistTrack | null) {
      this.menuTrack = track;
    },
    setActiveTrack(track: Track | PlaylistTrack | null) {
      this.activeTrack = track;
    },
  },
});
