<template>
  <section ref="sectionRef">
    <div class="scroll-panel">
      <h2 class="hidden-sm">
        &nbsp;
        <a :class="{ disabled: isAtStart }" @click="scrollLeft">
          <SvgIcon type="left" width="1rem"></SvgIcon>
        </a>
        <a :class="{ disabled: isAtEnd }" @click="scrollRight">
          <SvgIcon type="right" width="1rem"></SvgIcon>
        </a>
      </h2>
      <div ref="scrollPanelRef">
        <ul class="commom-grid flex-mode">
          <li
            v-for="item in props.data"
            :key="item.id"
            class="commom-grid-item"
            :style="{ width: computedItemWidth ? `${computedItemWidth}px` : 'auto' }"
          >
            <router-link :to="`/${props.dataType}/${item.id}`">
              <img v-fallback :src="imgMap.getPath(props.dataType, item)" />
              <span>
                {{ stringMap.getString(item, 'title') }}
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/base/SvgIcon.vue';

import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { usePreloadStore } from '@/stores';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game, Playlist } from '@/types';

const props = withDefaults(
  defineProps<{
    data: Game[] | Playlist[];
    dataType: 'game' | 'playlist';
    outPaddingWidth?: number;
  }>(),
  {
    outPaddingWidth: 30,
  }
);

const preloadStore = usePreloadStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const isAtStart = ref(true);
const isAtEnd = ref(false);
const sectionRef = ref<HTMLElement | null>(null);
const scrollPanelRef = ref<HTMLElement>();
const computedItemWidth = ref<number | null>(null);

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  preloadStore.setData(props.dataType, props.data);

  calculateItemWidth();
  resizeObserver = new ResizeObserver(calculateItemWidth);
  if (sectionRef.value) {
    resizeObserver.observe(sectionRef.value);
  }

  await nextTick();
  checkScrollPosition();
  scrollPanelRef.value?.addEventListener('scroll', checkScrollPosition);
});

onUnmounted(() => {
  scrollPanelRef.value?.removeEventListener('scroll', checkScrollPosition);
  resizeObserver?.disconnect();
});

watch(scrollPanelRef, () => {
  checkScrollPosition();
});

function calculateItemWidth() {
  if (!sectionRef.value) return;

  const refWidth = sectionRef.value.clientWidth;
  if (refWidth === 0) return;

  const minItemWidth = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue('--grid-min-width')
  );
  const gap = Number.parseFloat(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--root-gap-width-0')
  );
  const columns = Math.max(1, Math.floor((refWidth + gap) / (minItemWidth + gap)));
  const itemWidth = (refWidth - (columns - 1) * gap) / columns;
  computedItemWidth.value = Math.round(itemWidth);
}

function checkScrollPosition() {
  if (!scrollPanelRef.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = scrollPanelRef.value;
  isAtStart.value = scrollLeft === 0;
  isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 1;
}

function scrollLeft() {
  if (!scrollPanelRef.value || isAtStart.value) return;
  scrollPanelRef.value.scrollBy({
    left: -scrollPanelRef.value.clientWidth - props.outPaddingWidth,
    behavior: 'smooth',
  });
}

function scrollRight() {
  if (!scrollPanelRef.value || isAtEnd.value) return;
  scrollPanelRef.value.scrollBy({
    left: scrollPanelRef.value.clientWidth - props.outPaddingWidth,
    behavior: 'smooth',
  });
}
</script>

<style lang="scss" scoped>
section {
  @media (min-width: #{$breakpoint-md + 1px}) {
    margin-top: calc(-1.5rem * 1.5 - 24px) !important;

    .scroll-panel {
      @include verticalFlex(var(--root-gap-width-0));

      > h2 {
        display: flex;
        justify-content: right;
        gap: var(--root-gap-width-1);

        a {
          @include flexContentCenter();
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background-color: var(--root-bg-color-4);
          cursor: pointer;

          &:hover {
            background-color: var(--root-bg-color-5);
          }

          &.disabled {
            opacity: 0.2;
            cursor: not-allowed;
          }
        }
      }

      > div {
        position: relative;
        overflow-x: auto;
        scroll-behavior: smooth;
        display: flex;
        margin: 0 calc(var(--root-gap-width-1) * -2);
        scrollbar-color: transparent transparent;

        &:hover {
          scrollbar-color: $scrollbarColor transparent;
        }

        &:before,
        &:after {
          content: '';
          position: sticky;
          display: block;
          z-index: 1;
          flex-shrink: 0;
          width: calc(var(--root-gap-width-1) * 2);
          height: auto;
        }

        &:before {
          left: 0;
          background-image: linear-gradient(
            to left,
            transparent 0%,
            var(--root-bg-color-0) 85%
          );
        }

        &:after {
          right: 0;
          background-image: linear-gradient(
            to right,
            transparent 0%,
            var(--root-bg-color-0) 85%
          );
        }
      }
    }
  }
}
</style>
