<template>
  <Header :static="true"></Header>
  <div class="loading" v-if="loading">加载中...</div>
  <template v-else>
    <main id="main" v-if="data">
      <h2>播放列表 {{ pid }}</h2>
      <!-- 这里可以添加更多播放列表内容的显示 -->
    </main>
    <div v-else>
      <p>没有找到播放列表数据</p>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Header from '@/components/Header.vue';
import { useRoute } from 'vue-router';
import { useStore } from '@/stores';
import type { Playlist } from '@/types';
import axios from 'axios';

const route = useRoute();
const pid = route.params.pid as string;
const store = useStore();
const loading = ref<boolean>(false);
const data = ref<Playlist>();

onMounted(async () => {
  await getDetail();
});

async function getDetail() {
  loading.value = true;
  try {
    const res = await axios.get(`/api/proxy/nm/playlist/${pid}`, {
      params: {
        lang: store.mainLang
      }
    });

    data.value = res.data;
    if (!data.value) {
      return;
    }

    
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

</script>

<style lang="scss" scoped src="./styles.scss"></style>
