<template>
  <section>
    <router-link :to="`/playlist/${allPlaylist.id}`" class="jump-link">
      <span>
        {{ stringMap.getString(allPlaylist, 'title') }}
        <span class="text-light">({{ allPlaylist.tracksnum }})</span>
      </span>
      <SvgIcon type="right"></SvgIcon>
    </router-link>
    <template v-for="(group, i) in playlistGroups" :key="group.label">
      <div v-if="group.playlists.length">
        <h3>{{ t(`game.playlist.${group.label}`) }}</h3>
        <ul class="commom-grid">
          <template v-for="(playlist, j) in group.playlists" :key="playlist.id">
            <li
              class="commom-grid-item"
              v-if="i + j"
              :ref="
                (el) => {
                  if (i === 0 && j === 1) {
                    gridItemRef = el as HTMLElement;
                  }
                }
              "
            >
              <router-link :to="`/playlist/${playlist.id}`">
                <img
                  v-fallback
                  :src="imgMap.getPath('playlist', playlist)"
                  loading="lazy"
                />
                <span>
                  {{ stringMap.getString(playlist, 'title') }}
                  <span class="text-light">({{ playlist.tracksnum }})</span>
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { useElementWidth } from '@/composables/useElementWidth';
import SvgIcon from '@/components/SvgIcon.vue';
import type { Playlist } from '@/types';

const props = defineProps<{
  data: Playlist[];
}>();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const playlistGroups: { label: string; playlists: Playlist[] }[] = (() => {
  const groupMap = new Map<string, Playlist[]>();
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
    const selfList = groupMap.get('SINGLE_GAME')!;
    const [star, extend, other] = [
      selfList.filter((x) => x.type === 'BEST'),
      selfList.filter((x) => x.type === 'LOOP'),
      selfList.filter((x) => !['BEST', 'LOOP'].includes(x.type)),
    ];
    groupMap.set('SINGLE_GAME', [...other, ...extend, ...star]);
  });

  return Array.from(groupMap, ([label, playlists]) => ({ label, playlists }));
})();
const allPlaylist = playlistGroups[0].playlists[0];

const { t } = useI18n();
const gridItemRef = ref<HTMLElement | null>(null);
const elementWidth = useElementWidth(gridItemRef);
defineExpose({
  elementWidth,
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
