import { defineStore } from 'pinia';
import { getGames } from '@/api';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';

export const useGameStore = defineStore('game', {
  state: () => ({
    alreadyGetAllGames: false,
  }),
  actions: {
    async markAsInitialized(setGameData = false) {
      if (this.alreadyGetAllGames) {
        return;
      }
      if (setGameData) {
        const gameList = (await getGames('recent'))[0].games;
        useImgMap().setData('game', gameList);
        useLocalizationString().setData(gameList, 'title');
      }
      this.alreadyGetAllGames = true;
    },
  },
});
