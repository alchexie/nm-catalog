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
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game } from '@/types';

const props = defineProps<{
  data: Game[];
}>();

const imgMap = useImgMap();
const stringMap = useLocalizationString();

const sectionRef = ref<HTMLElement | null>(null);
const computedItemWidth = ref<number | null>(null);

const MIN_ITEM_WIDTH = 175;
const HORIZONTAL_GAP = 24;

function calculateItemWidth() {
  if (!sectionRef.value) return;

  const refWidth = sectionRef.value.clientWidth;
  const columns = Math.max(
    1,
    Math.floor((refWidth + HORIZONTAL_GAP) / (MIN_ITEM_WIDTH + HORIZONTAL_GAP))
  );
  const itemWidth = (refWidth - (columns - 1) * HORIZONTAL_GAP) / columns;
  computedItemWidth.value = Math.round(itemWidth);
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  imgMap.setData('game', props.data);
  stringMap.setData(props.data, 'title');

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
