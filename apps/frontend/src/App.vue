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
}

@media (min-width:#{$breakpoint-md + 1px}) {
  #main-container {
    margin-top: var(--main-header-height);
    margin-left: var(--main-nav-width);
    padding: 8px 32px 64px;
  }
}
</style>
