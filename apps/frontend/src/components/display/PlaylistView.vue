<template>
  <section>
    <router-link
      :to="`/playlist/${allPlaylist.id}`"
      class="jump-link"
      v-if="!props.noGroup"
    >
      <span>
        {{ stringMap.getString(allPlaylist, 'title') }}
        <span class="text-light">({{ allPlaylist.tracksnum }})</span>
      </span>
      <SvgIcon type="right"></SvgIcon>
    </router-link>
    <template v-for="(group, i) in playlistGroups" :key="group.label">
      <div v-if="group.playlists.length">
        <h3 v-if="!props.noGroup">{{ t(`game.playlist.${group.label}`) }}</h3>
        <ul class="commom-grid">
          <template v-for="(playlist, j) in group.playlists" :key="playlist.id">
            <li
              class="commom-grid-item"
              v-if="!props.noGroup ? i + j : playlist.type !== 'SINGLE_GAME_ALL'"
            >
              <router-link :to="`/playlist/${playlist.id}`">
                <img v-fallback :src="imgMap.getPath('playlist', playlist)" />
                <span>
                  {{ stringMap.getString(playlist, 'title') }}
                  <span class="text-light">({{ playlist.tracksnum }})</span>
                </span>
                <span
                  class="text-light"
                  v-if="props.belonging && playlist.type !== 'MULTIPLE'"
                >
                  <router-link :to="`/game/${props.belonging.id}`">
                    {{ stringMap.getString(props.belonging!, 'title') }}
                  </router-link>
                </span>
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/base/SvgIcon.vue';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game, Playlist } from '@/types';

const props = defineProps<{
  data: Playlist[];
  belonging?: Game;
  noGroup?: boolean;
}>();

const { t } = useI18n();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const playlistGroups: { label: string; playlists: Playlist[] }[] = (() => {
  const groupMap = new Map<string, Playlist[]>();
  if (!props.noGroup) {
    ['SINGLE_GAME', 'MULTIPLE'].forEach((x) => {
      groupMap.set(x, []);
    });

    props.data.forEach((x) => {
      switch (x.type) {
        case 'SINGLE_GAME_ALL':
          groupMap.get('SINGLE_GAME')?.unshift(x);
          break;
        case 'MULTIPLE':
          groupMap.get('MULTIPLE')?.push(x);
          break;
        default:
          groupMap.get('SINGLE_GAME')?.push(x);
          break;
      }
    });

    return Array.from(groupMap, ([label, playlists]) => ({ label, playlists }));
  } else {
    return [{ label: '', playlists: props.data }];
  }
})();
const allPlaylist = playlistGroups[0].playlists[0];

onMounted(() => {
  imgMap.setData('playlist', props.data);
  stringMap.setData(props.data, 'title').setData(props.data, 'desc');
});
</script>

<style lang="scss" scoped>
section {
  @include verticalFlex(var(--root-gap-width-0));

  > div {
    h3 {
      font-size: 1.25rem;

      &:empty {
        display: none;
      }
    }
  }
}
</style>
