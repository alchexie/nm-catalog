<template>
  <nav id="main-nav">
    <div class="brand" @click.stop="router.push(`/`)">
      <img src="/favicon.svg" />
      <span>{{ title }}</span>
    </div>
    <button class="display-sm">
      <SvgIcon type="menu" width="24px" color="white"></SvgIcon>
    </button>
    <nav class="menu">
      <router-link
        v-for="(item, index) in computedMenu"
        :key="index"
        :to="item.path"
        :class="{ active: route.path.startsWith(item.path) }"
      >
        <SvgIcon :type="item.path.slice(1)" width="28px" color="currentColor"></SvgIcon>
        {{ item.name }}
      </router-link>
    </nav>
    <div class="slot hidden-sm">
      <hr />
      <div>
        <slot></slot>
      </div>
    </div>
  </nav>
  <header id="main-header" class="hidden-sm">
    <a
      href="https://music.nintendo.com"
      target="_blank"
      rel="noopener noreferrer"
      referrerpolicy="no-referrer"
      >Go to <b>Nintendo Music</b> Official Website</a
    >
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { MAIN_TITLE } from '@/types';
import { ElementTracker } from '@/utils/element-tracker';
import SvgIcon from '@/components/SvgIcon.vue';

const props = withDefaults(
  defineProps<{
    static?: boolean;
    observeRef?: HTMLElement;
  }>(),
  { static: false }
);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const title = MAIN_TITLE;
const refVisible = ref<boolean>(true);
const tracker = new ElementTracker((entries) => {
  const entry = entries[0];
  refVisible.value = entry.isIntersecting;
});

const computedMenu = computed(() => {
  return [
    {
      name: t('common.game'),
      path: '/game',
    },
    {
      name: t('common.playlist'),
      path: '/playlist',
    },
  ];
});

watch(
  () => props.observeRef,
  (elRef) => {
    tracker.disconnect();
    if (elRef) {
      tracker.observe(elRef);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped src="./styles.scss"></style>
