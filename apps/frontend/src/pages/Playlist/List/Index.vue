<template>
  <Container :loading="loading">
    <section
      class="list-group"
      v-for="(section, i) in computedPlaylistSections"
      :key="section.tag"
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
            <img v-fallback :src="playlist.$imgPath" loading="lazy" />
            <span>
              {{ playlist.$title }}
              <SvgIcon
                type="expired"
                fill="#00ACC1"
                v-if="playlist.isexpired"
              ></SvgIcon>
            </span>
          </router-link>
        </li>
      </ul>
    </section>
  </Container>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNavigationr } from '@/composables/useNavigationr';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import SideNav from '@/components/SideNav/Index.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { getPlaylistSections } from '@/api';
import type { PlaylistSection } from '@/types';

const { t } = useI18n();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const playlistSections = ref<PlaylistSection[]>([]);
const groupRefs = ref<HTMLElement[]>([]);

const computedPlaylistSections = computed(() =>
  playlistSections.value.map((x) => ({
    ...x,
    name: t(`playlist.section.${x.tag}`),
    playlists: x.playlists.map((y) => ({
      ...y,
      $title: stringMap.getString(y, 'title'),
      $imgPath: imgMap.getPath('game', y),
    })),
  }))
);

const computedPlaylistGroups = computed(() =>
  computedPlaylistSections.value.map((x) => ({
    label: x.name,
    count: x.playlists.length,
  }))
);

useNavigationr({
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
  const result = await request(getPlaylistSections());
  const playlistList = result.map((x) => x.playlists).reduce((a, b) => [...a, ...b]);
  imgMap.setData('game', playlistList);
  stringMap.setData(playlistList, 'title');
  playlistSections.value = result;
});
</script>

<style lang="scss" scoped>
section {
  margin-bottom: calc(var(--root-gap-width-0) * 2);

  h1 {
    margin: 0;
    margin-bottom: var(--root-gap-width-0);
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
