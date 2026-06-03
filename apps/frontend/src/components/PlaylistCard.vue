<template>
  <router-link :to="`/playlist/${playlist.id}`" class="playlist">
    <img v-fallback :src="imgMap.getPath('playlist', playlist)" loading="lazy" />
    <span> {{ stringMap.getString(playlist, 'title') }} ({{ playlist.tracksnum }}) </span>
  </router-link>
</template>

<script setup lang="ts">
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { type Playlist } from '@/types';

defineProps<{
  playlist: Playlist;
}>();

const imgMap = useImgMap();
const stringMap = useLocalizationString();
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.playlist {
  > img {
    width: 100%;
    min-height: 180px;
    border-radius: 8px;
  }
}

@media (max-width: $breakpoint-md) {
  .playlist {
    > img {
      display: none;
    }
  }
}
</style>
