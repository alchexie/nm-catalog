import { defineStore } from 'pinia';
import { getGames, getPlaylistSections } from '@/api';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game, NMData, Playlist } from '@/types';

const imgMap = useImgMap();
const stringMap = useLocalizationString();

export const usePreloadStore = defineStore('preload', {
  state: () => ({
    gameList: null as Game[] | null,
    playlistList: null as Playlist[] | null,
  }),
  actions: {
    async ensureLoaded(
      dataType: 'game' | 'playlist',
      data?: Game[] | Playlist[]
    ): Promise<Game[] | Playlist[]> {
      let result;
      if (dataType === 'game') {
        if (this.gameList) {
          return this.gameList;
        }
        result = (data ?? (await getGames('recent'))[0].games) as Game[];
        this.gameList = result;
      } else {
        if (this.playlistList) {
          return this.playlistList;
        }
        result = (data ??
          (await getPlaylistSections())
            .map((x) => x.playlists)
            .reduce((a, b) => [...a, ...b])) as Playlist[];
        this.playlistList = result;
      }
      imgMap.setData(dataType, result);
      stringMap.setData(result, 'title');
      return result;
    },
    setData(dataType: 'game' | 'track' | 'playlist', data: NMData[]): void {
      imgMap.setData(dataType, data);
      stringMap.setData(data, 'title');
      if (dataType === 'playlist') {
        stringMap.setData(data, 'desc');
      }
    },
  },
});
