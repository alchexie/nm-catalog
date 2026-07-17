<template>
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
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '../base/SvgIcon.vue';

import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

const props = defineProps<{
  outPaddingWidth: number;
}>();

const scrollPanelRef = ref<HTMLElement>();
const isAtStart = ref(true);
const isAtEnd = ref(false);

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  checkScrollPosition();
  scrollPanelRef.value?.addEventListener('scroll', checkScrollPosition);

  resizeObserver = new ResizeObserver(() => {
    checkScrollPosition();
  });
  if (scrollPanelRef.value) {
    resizeObserver.observe(scrollPanelRef.value);
  }
});

onUnmounted(() => {
  scrollPanelRef.value?.removeEventListener('scroll', checkScrollPosition);
  resizeObserver?.disconnect();
});

watch(scrollPanelRef, () => {
  checkScrollPosition();
});

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
@media (min-width: #{$breakpoint-md + 1px}) {
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

      &:not(&:hover) {
        &::-webkit-scrollbar {
          display: none;
          width: 0;
          background: transparent;
        }
        scrollbar-width: none;
      }
    }
  }
}
</style>
