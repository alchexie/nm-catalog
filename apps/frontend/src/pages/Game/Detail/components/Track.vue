<template>
  <section :hidden="hidden">
    <div class="radio-group">
      <label v-for="tag in computedTrackTags" :key="tag.key">
        <input
          type="radio"
          :value="tag.key"
          v-model="selectedTrackTag"
          :disabled="!tag.count"
        />
        <span>{{ t(`track.tag.${tag.key}`) }} ({{ tag.count }})</span>
      </label>
    </div>
    <TrackItem
      v-for="track in displayData"
      :key="track.id"
      :data="track"
      :hidden="
        (selectedTrackTag === 'TOP' && !track.isbest) ||
        (selectedTrackTag === 'LOOP' && !track.isloop)
      "
    >
    </TrackItem>
    <div ref="loadMoreRef" class="load-more"></div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoadMore } from '@/composables/useLoadMore';
import TrackItem from '@/components/TrackItem.vue';
import { TrackTag, type Track } from '@/types';
import { ElementTracker } from '@/utils/element-tracker';

const props = defineProps<{
  hidden: boolean;
  data: Track[];
}>();

const { t } = useI18n();
const { displayData, loadMore, hasRemainedData } = useLoadMore(props.data);
const selectedTrackTag = ref<TrackTag>('ALL');
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

const computedTrackTags = computed(() => {
  return TrackTag.map((x) => ({
    key: x,
    label: t(`track.tag.${x}`),
    count: getTrackCount(x),
  }));
});

onMounted(async () => {
  tracker.observe(loadMoreRef.value as HTMLElement);
});

function getTrackCount(mode: TrackTag): number {
  switch (mode) {
    case 'ALL':
      return props.data.length;
    case 'TOP':
      return props.data.filter((x) => x.isbest).length;
    case 'LOOP':
      return props.data.filter((x) => x.isloop).length;
  }
}
</script>

<style lang="scss" scoped>
.radio-group {
  margin-bottom: 1.5em;
  text-align: right;
  font-size: 0.9rem;

  label {
    display: inline-flex;
    align-items: center;
    margin-right: 1.5em;
    cursor: pointer;

    input[type='radio'] {
      margin: 0;

      + span {
        display: inline-block;
        opacity: 0.5;
        font-weight: bolder;
        font-size: 0.9em;
        text-indent: 0.5em;
      }

      &:checked {
        + span {
          opacity: 1;
        }
      }

      &:disabled {
        + span {
          opacity: 0.25;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
