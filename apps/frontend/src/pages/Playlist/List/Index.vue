<template>
  <LoadingContainer :loading="loading" full-height>
    <section
      class="list-group"
      v-for="(section, i) in computedPlaylistSections"
      :key="i"
      :ref="
        (el) => {
          if (el) {
            groupRefs[i] = el as HTMLElement;
          }
        }
      "
    >
      <h1>{{ section.name }}</h1>
      <ul class="commom-grid">
        <li
          class="commom-grid-item"
          :class="{ expired: playlist.isexpired }"
          v-for="playlist in section.playlists"
          :key="playlist.id"
        >
          <router-link
            :to="`/playlist/${playlist.id}`"
            :title="
              playlist.$title + (playlist.isexpired ? ` ${t('playlist.expired')}` : '')
            "
          >
            <img v-fallback :src="playlist.$imgPath" />
            <span>
              {{ playlist.$title }}
              <SvgIcon type="expired" fill="#00ACC1" v-if="playlist.isexpired"></SvgIcon>
            </span>
          </router-link>
        </li>
      </ul>
    </section>
    <section class="list-group hidden-sm">
      <h1>{{ t('playlist.section.CHARACTER') }}</h1>
      <section
        v-for="(section, j) in computedCharacterPlaylistSections"
        :key="j"
        :ref="
          (el) => {
            if (el) {
              groupRefs[`${computedPlaylistSections.length}_${j}`] = el as HTMLElement;
            }
          }
        "
      >
        <h2>{{ section.series?.$title }}</h2>
        <HorizontalScrollView
          :data="section.playlists"
          dataType="playlist"
        ></HorizontalScrollView>
      </section>
    </section>
  </LoadingContainer>
</template>

<script setup lang="ts">
import LoadingContainer from '@/components/base/LoadingContainer.vue';
import SvgIcon from '@/components/base/SvgIcon.vue';
import SideNav, { type SideNavOption } from '@/components/display/SideNav/Index.vue';
import HorizontalScrollView from '@/components/display/HorizontalScrollView.vue';

import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLangStore, usePreloadStore } from '@/stores';
import { useNavigation } from '@/composables/useNavigation';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { getCharacterPlaylistSections, getPlaylistSections } from '@/api';
import type { PlaylistSection } from '@/types';
import type { CharacterPlaylistSection } from '@nm-catalog/shared';
import { getLangText } from '@/utils/data-utils';

const { t } = useI18n();
const { loading, request } = useRequest();
const langStore = useLangStore();
const preloadStore = usePreloadStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const playlistSections = ref<PlaylistSection[]>([]);
const characterPlaylistSections = ref<CharacterPlaylistSection[]>([]);
const groupRefs = ref<Record<string, HTMLElement>>({});

const computedPlaylistSections = computed(() =>
  playlistSections.value.map((x) => ({
    ...x,
    name: t(`playlist.section.${x.tag}`),
    playlists: x.playlists.map((y) => ({
      ...y,
      $title: stringMap.getString(y, 'title'),
      $imgPath: imgMap.getPath('playlist', y),
    })),
  }))
);
const computedCharacterPlaylistSections = computed(() =>
  characterPlaylistSections.value.map((x) => ({
    ...x,
    series: x.series
      ? {
          ...x.series,
          $title: getLangText(x.series, 'title', langStore.mainLang),
        }
      : { $title: t('game.uncategorized') },
    playlists: x.playlists.map((y) => ({
      ...y,
      $title: stringMap.getString(y, 'title'),
      $imgPath: imgMap.getPath('playlist', y),
    })),
  }))
);
const computedPlaylistGroups = computed(() => {
  const groups: SideNavOption[] = computedPlaylistSections.value.map((x, i) => ({
    key: i.toString(),
    label: x.name,
    count: x.playlists.length,
  }));
  const characterKey = computedPlaylistSections.value.length.toString();
  groups.push({
    key: characterKey,
    label: t('playlist.section.CHARACTER'),
    children: computedCharacterPlaylistSections.value.map((x, j) => ({
      key: `${characterKey}_${j}`,
      label: x.series.$title,
      count: x.playlists.length,
    })),
  });
  return groups;
});

useNavigation({
  template: {
    setup() {
      return () => {
        if (!computedPlaylistSections.value.length) return null;
        return h(SideNav, {
          data: {
            title: t('common.playlist'),
          },
          options: computedPlaylistGroups.value,
          targetNodes: groupRefs.value,
        });
      };
    },
  },
});

onMounted(async () => {
  let result: any[] = (await request(getPlaylistSections())) as PlaylistSection[];
  const sectionPlaylistList = result
    .map((x) => x.playlists)
    .reduce((a, b) => [...a, ...b]);
  await preloadStore.ensureSectionPlaylistData(sectionPlaylistList);
  playlistSections.value = result;

  result = (await request(getCharacterPlaylistSections())) as CharacterPlaylistSection[];
  preloadStore.setData('playlist', result.map((x) => x.playlists).flat());
  characterPlaylistSections.value = result;
});
</script>

<style lang="scss" scoped>
section {
  margin-bottom: calc(var(--root-gap-width-0) * 2);

  h1 {
    margin: 0;
    margin-bottom: var(--root-gap-width-0);
    font-size: 1.25rem;
  }

  h2 {
    color: var(--root-text-color-light);
    font-size: 1.125rem;
  }
}

.expired {
  opacity: 0.5;

  > a {
    > span {
      > svg {
        display: inline;
        transform: translateY(0.15em);
      }
    }
  }
}
</style>
