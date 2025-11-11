<template>
  <RouterView v-slot="{ Component, route }">
    <keep-alive include="Game,Track">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </RouterView>
  <Footer></Footer>
</template>

<script setup lang="ts">
import Footer from '@/components/Footer.vue';
import { MAIN_TITLE } from '@/types';

document.title = MAIN_TITLE;
</script>
