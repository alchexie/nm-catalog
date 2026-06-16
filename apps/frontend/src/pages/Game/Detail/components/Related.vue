<template>
  <section>
    <ScrollPanel :out-padding-width="30">
      <ul class="commom-grid flex-mode">
        <li
          v-for="relate in data"
          :key="relate.id"
          class="commom-grid-item"
          :style="{ width: gridItemWidth ? `${gridItemWidth}px` : 'auto' }"
        >
          <router-link :to="`/game/${relate.id}`">
            <img v-fallback :src="imgMap.getPath('game', relate)" loading="lazy" />
            <span>
              {{ stringMap.getString(relate, 'title') }}
            </span>
          </router-link>
        </li>
      </ul>
    </ScrollPanel>
  </section>
</template>

<script setup lang="ts">
import ScrollPanel from '@/components/ScrollPanel.vue';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game } from '@/types';

defineProps<{
  data: Game[];
  gridItemWidth?: number;
}>();

const imgMap = useImgMap();
const stringMap = useLocalizationString();
</script>

<style lang="scss" scoped>
@media (min-width: #{$breakpoint-md + 1px}) {
  section {
    margin-top: calc(-1.5rem * 1.5 - 24px)!important;
  }
}
</style>
