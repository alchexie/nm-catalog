<template>
  <Container :loading="loading">
    <main id="list-main">
      <section
        class="list-group"
        v-for="section in computedPlaylistSections"
        :key="section.tag"
      >
        <h1>{{ section.name }}</h1>
        <ul class="group-content">
          <li
            class="content-item"
            v-for="playlist in section.playlists"
            :key="playlist.id"
          >
            <router-link :to="`/playlist/${playlist.id}`" :title="playlist.$title">
              <img v-fallback :src="playlist.$imgPath" loading="lazy" />
              <span>{{ playlist.$title }}</span>
            </router-link>
          </li>
        </ul>
      </section>
    </main>
  </Container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHeader } from '@/composables/useHeader';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import { getPlaylistSections } from '@/api';
import type { PlaylistSection } from '@/types';

const { t } = useI18n();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const playlistSections = ref<PlaylistSection[]>([]);

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

useHeader();

onMounted(async () => {
  const result = await request(getPlaylistSections());
  const playlistList = result.map((x) => x.playlists).reduce((a, b) => [...a, ...b]);
  imgMap.setData('game', playlistList);
  stringMap.setData(playlistList, 'title');
  playlistSections.value = result;
});
</script>

<style lang="scss" scoped>
#list-main {
  padding-top: 60px;
}
</style>
