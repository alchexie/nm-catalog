import { defineStore } from 'pinia';
import { STORAGE_KEY, TrackViewModes, type TrackViewMode } from '@/types';

export const useTrackViewStore = defineStore('trackView', {
  state: () => ({
    viewMode: (() => {
      const cached = localStorage.getItem(STORAGE_KEY.TRACK_VIEW_MODE);
      return TrackViewModes.includes(cached as TrackViewMode)
        ? (cached as TrackViewMode)
        : 'detail';
    })(),
    isShowGame: (() => {
      const cached = localStorage.getItem(STORAGE_KEY.TRACK_SHOW_GAME);
      return cached === null ? true : cached === 'true';
    })(),
  }),
  actions: {
    setViewMode(viewMode: TrackViewMode) {
      this.viewMode = viewMode;
      localStorage.setItem(STORAGE_KEY.TRACK_VIEW_MODE, viewMode);
    },
    setIsShowGame(isShowGame: boolean) {
      this.isShowGame = isShowGame;
      localStorage.setItem(STORAGE_KEY.TRACK_SHOW_GAME, String(isShowGame));
    },
  },
});
