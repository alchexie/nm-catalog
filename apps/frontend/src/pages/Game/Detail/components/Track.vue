<template>
  <section>
    <div class="switch">
      <MultiSwitcher
        v-model="trackViewMode[0]"
        :options="['all', 'star', 'extend']"
        desc-prefix="track.tag"
        expand
      ></MultiSwitcher>
      <MultiSwitcher
        v-model="trackViewMode[1]"
        :options="['grid', 'list', 'detail']"
        desc-prefix="track.display"
        :class="{ 'hidden-sm': true }"
      ></MultiSwitcher>
    </div>
    <ul class="switch-view" :class="trackViewMode[1]">
      <li
        v-for="track in displayData"
        :key="track.id"
        :hidden="
          (trackViewMode[0] === 'star' && !track.isbest) ||
          (trackViewMode[0] === 'extend' && !track.isloop)
        "
      >
        <TrackItem :data="track" :view-mode="trackViewMode[1]"></TrackItem>
      </li>
    </ul>
    <div ref="loadMoreRef" class="load-more display-sm"></div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLoadMore } from '@/composables/useLoadMore';
import MultiSwitcher from '@/components/MultiSwitcher.vue';
import TrackItem from '@/components/TrackItem/Index.vue';
import { type Track } from '@/types';
import { ElementTracker } from '@/utils/element-tracker';

const props = defineProps<{
  data: Track[];
}>();

const { displayData, loadMore, hasRemainedData, loadAll } = useLoadMore(props.data);
const trackViewMode = ref<['all' | 'star' | 'extend', 'grid' | 'list' | 'detail']>([
  'all',
  'detail',
]);
const loadMoreRef = ref<HTMLElement>();
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
