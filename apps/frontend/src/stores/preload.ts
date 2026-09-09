import { defineStore } from 'pinia';
import { getGames, getPlaylistByGame, getPlaylistSections } from '@/api';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game, NMData, Playlist } from '@/types';

const imgMap = useImgMap();
const stringMap = useLocalizationString();

export const usePreloadStore = defineStore('preload', {
  state: () => ({
    gameList: null as Game[] | null,
    sectionPlaylistList: null as Playlist[] | null,
    gamePlaylistMap: new Map<string, Playlist[]>(),
  }),
  actions: {
    setData(dataType: 'game' | 'track' | 'playlist', data: NMData[]): void {
      imgMap.setData(dataType, data);
      stringMap.setData(data, 'title');
      if (dataType === 'playlist') {
        stringMap.setData(data, 'desc');
      }
    },
    async ensureGameData(data?: Game[]): Promise<Game[]> {
      if (this.gameList) {
        return this.gameList;
      }
      const result = (data ?? (await getGames('recent'))[0].games) as Game[];
      this.gameList = result;
      this.setData('game', result);
      return result;
    },
    async ensureSectionPlaylistData(data?: Playlist[]): Promise<Playlist[]> {
      if (this.sectionPlaylistList) {
        return this.sectionPlaylistList;
      }
      const result = (data ??
        (await getPlaylistSections())
          .map((x) => x.playlists)
          .reduce((a, b) => [...a, ...b])) as Playlist[];
      this.sectionPlaylistList = result;
      this.setData('playlist', result);
      return result;
    },
    async ensureGamePlaylistData(gid: string): Promise<Playlist[]> {
      if (this.gamePlaylistMap.has(gid)) {
        return this.gamePlaylistMap.get(gid)!;
      }
      const result = await getPlaylistByGame(gid);
      this.gamePlaylistMap.set(gid, result);
      this.setData('playlist', result);
      return result;
    },
  },
});
