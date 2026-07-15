<template>
  <section>
    <div class="switch">
      <MultiSwitcher
        v-model="trackTagFilter"
        :options="['all', 'star', 'extend']"
        desc-prefix="track.tag"
        expand
      ></MultiSwitcher>
      <MultiSwitcher
        v-model="trackViewMode"
        :options="['grid', 'list', 'detail']"
        desc-prefix="track.display"
        :class="{ 'hidden-sm': true }"
      ></MultiSwitcher>
    </div>
    <ul class="switch-view" :class="trackViewMode">
      <li
        v-for="track in displayData"
        :key="track.id"
        :hidden="
          (trackTagFilter === 'star' && !track.isbest) ||
          (trackTagFilter === 'extend' && !track.isloop)
        "
      >
        <TrackItem :data="track" :view-mode="trackViewMode"></TrackItem>
      </li>
    </ul>
    <div ref="loadMoreRef" class="load-more display-sm"></div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useLoadMore } from '@/composables/useLoadMore';
import MultiSwitcher from '@/components/MultiSwitcher.vue';
import TrackItem from '@/components/TrackItem/Index.vue';
import { type Track } from '@/types';
import { ElementTracker } from '@/utils/element-tracker';
import { useTrackViewStore } from '@/stores';

const props = defineProps<{
  data: Track[];
}>();

const trackViewStore = useTrackViewStore();
const { displayData, loadMore, hasRemainedData, loadAll } = useLoadMore(props.data);
const loadMoreRef = ref<HTMLElement>();
const trackTagFilter = ref<'all' | 'star' | 'extend'>('all');
const trackViewMode = computed({
  get: () => trackViewStore.viewMode,
  set: (value) => trackViewStore.setViewMode(value),
});
const tracker = new ElementTracker(async (entries) => {
  const entry = entries[0];
  if (entry.isIntersecting) {
    await loadMore();
    if (!hasRemainedData()) {
      tracker.disconnect();
    }
  }
});

onMounted(async () => {
  const setupObserver = () => {
    const isVisible = window.getComputedStyle(loadMoreRef.value!).display !== 'none';
    if (isVisible) {
      tracker.observe(loadMoreRef.value!);
    } else {
      tracker.disconnect();
      loadAll();
      window.removeEventListener('resize', setupObserver);
    }
  };

  setupObserver();
  if (hasRemainedData()) {
    window.addEventListener('resize', setupObserver);
  }
});
</script>

<style lang="scss" scoped>
section {
  @include verticalFlex(var(--root-gap-width-0));

  > .switch {
    @include flexContentCenter();
    > a {
      &:last-child {
        margin-left: auto;
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  section {
    > .switch {
      justify-content: center;
    }
  }
}
</style>
