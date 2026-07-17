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
    <a v-external-link :href="OFFICIAL_URL">
      {{ t('official.goPrefix') }} <b>Nintendo Music</b> {{ t('official.site')
      }}{{ t('official.goSuffix') }}
    </a>
  </header>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/base/SvgIcon.vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { MAIN_TITLE, OFFICIAL_URL } from '@/types';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const title = MAIN_TITLE;

const computedMenu = computed(() => [
  { name: t('common.game'), path: '/game' },
  { name: t('common.playlist'), path: '/playlist' },
]);
</script>

<style lang="scss" scoped src="./styles.scss"></style>
