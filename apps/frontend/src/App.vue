<template>
  <MainNav>
    <component :is="navigationStore.template" />
  </MainNav>
  <main id="main-container">
    <RouterView v-slot="{ Component, route }">
      <keep-alive>
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </RouterView>
  </main>
  <Footer></Footer>
</template>

<script setup lang="ts">
import MainNav from '@/components/layouts/MainNav/Index.vue';
import Footer from '@/components/layouts/Footer.vue';

import { useNavigationStore } from './stores';

const navigationStore = useNavigationStore();
</script>

<style lang="scss" scoped>
#main-container {
  position: relative;
  padding: 72px 24px;
  container-type: inline-size;
  container-name: main-container;
  overflow-y: auto;
}

@media (min-width:#{$breakpoint-md + 1px}) {
  #main-container {
    margin-top: var(--main-header-height);
    margin-left: var(--main-nav-width);
    height: calc(100vh - var(--main-header-height) - var(--main-footer-height));
    padding: 8px 32px 64px;
    transition: margin-right 0.25s ease;

    &:has(.track-detail-drawer:not(.drawer-slide-leave-active)) {
      margin-right: calc(var(--drawer-width) + var(--root-gap-width-2) + 1px);
    }
  }
}
</style>
