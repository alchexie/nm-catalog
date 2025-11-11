<template>
  <header id="header" :class="{ detail: !refVisible }" @click.stop="goHome">
    <template v-if="static || refVisible">{{ title }}</template>
    <template v-else> <slot></slot> </template>
  </header>
</template>

<script setup lang="ts">
import { nextTick, onActivated, onDeactivated, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MAIN_TITLE } from '@/types';
import { ElementTracker } from '@/utils/element-tracker';

const props = withDefaults(
  defineProps<{
    static?: boolean;
    observeRef?: HTMLElement;
  }>(),
  { static: false }
);
const router = useRouter();
const title = MAIN_TITLE;
const refVisible = ref<boolean>(true);
const tracker = new ElementTracker((entries) => {
  const entry = entries[0];
  refVisible.value = entry.isIntersecting;
});

onMounted(() => {
  if (!props.static) {
    const stop = watch(
      () => props.observeRef,
      (elRef) => {
        if (elRef) {
          tracker.observe(elRef);
          stop();
        }
      },
      { immediate: true }
    );
  }
});

onActivated(async () => {
  if (props.static) {
    return;
  }
  if (!props.observeRef) {
    return;
  }
  await nextTick();
  tracker.reconnect();
});

onDeactivated(() => {
  if (props.static) {
    return;
  }
  tracker.disconnect();
});

function goHome() {
  if (!refVisible.value) {
    return;
  }
  router.push(`/`);
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

#header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  padding: 0 1.5rem;
  background-color: $header-bgColor;
  box-shadow: 0 0 1.5rem 1rem rgba($root-bgColor, 0.7);
  color: $header-textColor;
  opacity: 1;
  transition: all 0.3s ease;
  font: bold 1rem 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 2.3em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &.detail {
    background-color: $header-bgColor-detail;
    color: $header-textColor-detail;
    cursor: default;
  }
}

@media (prefers-color-scheme: light) {
  #header {
    box-shadow: 0 0 1.5rem 1rem rgba($root-bgColor-light, 0.7);

    &.detail {
      background-color: $header-bgColor-detail-light;
      color: $header-textColor-detail-light;
    }
  }
}

@media (max-width: 767px) {
  #header {
    font-size: 1.2rem;
    line-height: 2.4rem;
    box-shadow: none;
  }
}
</style>
