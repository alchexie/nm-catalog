<template>
  <section ref="sectionRef">
    <HorizontalScrollPanel :out-padding-width="30">
      <ul class="commom-grid flex-mode">
        <li
          v-for="relate in props.data"
          :key="relate.id"
          class="commom-grid-item"
          :style="{ width: computedItemWidth ? `${computedItemWidth}px` : 'auto' }"
        >
          <router-link :to="`/game/${relate.id}`">
            <img v-fallback :src="imgMap.getPath('game', relate)" />
            <span>
              {{ stringMap.getString(relate, 'title') }}
            </span>
          </router-link>
        </li>
      </ul>
    </HorizontalScrollPanel>
  </section>
</template>

<script setup lang="ts">
import HorizontalScrollPanel from '@/components/base/HorizontalScrollPanel.vue';

import { ref, onMounted, onUnmounted } from 'vue';
import { usePreloadStore } from '@/stores';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game } from '@/types';

const props = defineProps<{
  data: Game[];
}>();

const preloadStore = usePreloadStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const sectionRef = ref<HTMLElement | null>(null);
const computedItemWidth = ref<number | null>(null);

function calculateItemWidth() {
  if (!sectionRef.value) return;

  const refWidth = sectionRef.value.clientWidth;
  const minItemWidth = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue('--grid-min-width')
  );
  const gap = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue('--root-gap-width-0')
  );
  const columns = Math.max(1, Math.floor((refWidth + gap) / (minItemWidth + gap)));
  const itemWidth = (refWidth - (columns - 1) * gap) / columns;
  computedItemWidth.value = Math.round(itemWidth);
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  preloadStore.setData('game', props.data);
  calculateItemWidth();
  resizeObserver = new ResizeObserver(calculateItemWidth);
  if (sectionRef.value) {
    resizeObserver.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
@media (min-width: #{$breakpoint-md + 1px}) {
  section {
    margin-top: calc(-1.5rem * 1.5 - 24px) !important;
  }
}
</style>
