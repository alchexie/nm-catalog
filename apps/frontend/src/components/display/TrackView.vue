<template>
  <section>
    <div class="toolbar">
      <span v-if="props.playlistMode" class="text-light">{{ duration }}</span>
      <template v-else>
        <MultiSwitcher
          v-model="trackTagFilter"
          :options="['all', 'star', 'extend']"
          desc-prefix="track.tag"
          expand
        ></MultiSwitcher>
      </template>
      <div class="toolbar-right">
        <a
          v-if="props.groupMode"
          class="toggle"
          :class="{ active: isShowGroup }"
          :title="t('playlist.setting')"
          @click.stop="isShowGroup = !isShowGroup"
        >
          <SvgIcon :type="isShowGroup ? 'group' : 'ungroup'" height="1.5em"></SvgIcon>
        </a>
        <MultiSwitcher
          v-model="trackViewMode"
          :options="['grid', 'list', 'detail']"
          desc-prefix="track.display"
          :class="{ 'hidden-sm': true }"
        ></MultiSwitcher>
      </div>
    </div>
    <ul class="switch-view" :class="trackViewMode">
      <template v-if="!groupMode">
        <li
          v-for="track in displayData"
          :key="track.id"
          :hidden="
            (trackTagFilter === 'star' && !track.isbest) ||
            (trackTagFilter === 'extend' && !track.isloop)
          "
        >
          <TrackItem
            :data="track"
            :view-mode="trackViewMode"
            :hide-tag="props.playlistMode"
          ></TrackItem>
        </li>
      </template>
      <template v-else>
        <template v-for="(group, i) in groups">
          <template v-if="!i || displayData.length >= group.tracks[0].pidx">
            <li class="full-row" :hidden="!isShowGroup">
              <template v-if="group.game">
                <router-link :to="`/game/${group.game.id}`" class="jump-link">
                  <img v-fallback :src="imgMap.getPath('game', group.game)" />
                  <div>
                    <span>{{ stringMap.getString(group.game, 'title') }}</span>
                    <span class="text-light">
                      {{ group.game.year }} · {{ group.game.hardware }}
                    </span>
                  </div>
                  <SvgIcon type="right"></SvgIcon>
                </router-link>
              </template>
              <template v-else>
                <a class="jump-link">{{ t(`playlist.type.SPECIAL`) }}</a>
              </template>
            </li>
            <template v-for="track in group.tracks" :key="track.id">
              <li v-if="displayData.length >= track.pidx">
                <TrackItem
                  :data="track"
                  :idx="track.pidx"
                  :view-mode="trackViewMode"
                  :hide-tag="true"
                  :from-game="group.game"
                  :hide-game="isShowGroup"
                >
                </TrackItem>
              </li>
            </template>
          </template>
        </template>
      </template>
    </ul>
    <div ref="loadMoreRef" class="load-more display-sm"></div>
  </section>
</template>

<script setup lang="ts">
import MultiSwitcher from './MultiSwitcher.vue';
import TrackItem from './TrackItem/Index.vue';
import SvgIcon from '@/components/base/SvgIcon.vue';

import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePreloadStore, useTrackViewStore } from '@/stores';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { useLoadMore } from '@/composables/useLoadMore';
import { type Track, type PlaylistTrack, type PlaylistTrackGroup } from '@/types';
import { ElementTracker } from '@/utils/element-tracker';
import { getTotalDuration } from '@/utils/data-utils';

const props = withDefaults(
  defineProps<{
    data: Track[] | PlaylistTrackGroup[];
    groupMode?: boolean;
    playlistMode?: boolean;
  }>(),
  {
    groupMode: false,
    playlistMode: false,
  }
);

const trackViewStore = useTrackViewStore();
const preloadStore = usePreloadStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const { displayData, loadMore, hasRemainedData, loadAll, stopLoadAll, resetData } =
  useLoadMore<PlaylistTrack | Track>([]);
const { t } = useI18n();

const loadMoreRef = ref<HTMLElement>();
const trackTagFilter = ref<'all' | 'star' | 'extend'>('all');

const groups = computed(() =>
  props.groupMode ? (props.data as PlaylistTrackGroup[]) : []
);
const flatTracks = computed(() => {
  if (props.groupMode) {
    return (props.data as PlaylistTrackGroup[]).map((x) => x.tracks).flat();
  }
  return props.data as Track[];
});
const duration = computed(() => {
  const tracks = flatTracks.value;
  const count = tracks.length;
  const duration = getTotalDuration(tracks as Track[]);
  const timeStr =
    (duration.hour ? `${duration.hour}${t('common.hour')}` : '') +
    `${duration.minute}${t('common.minute')}`;
  return `${t('playlist.trackCount', { count })} · ${timeStr}`;
});
const isShowGroup = computed({
  get: () => trackViewStore.isShowGame,
  set: (value) => trackViewStore.setIsShowGroup(value),
});
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

const setupObserver = () => {
  const isVisible = window.getComputedStyle(loadMoreRef.value!).display !== 'none';
  if (isVisible) {
    tracker.observe(loadMoreRef.value!);
  } else {
    tracker.disconnect();
    loadAll(() => window.removeEventListener('resize', setupObserver));
  }
};

onMounted(async () => {
  resetData(flatTracks.value);
  if (props.groupMode) {
    const trackGroups = props.data as PlaylistTrackGroup[];
    const tracks = trackGroups.map((x) => x.tracks).flat();
    const games = trackGroups.filter((x) => x.game).map((x) => x.game!);
    preloadStore.setData('game', games);
    preloadStore.setData('track', tracks);
  } else {
    preloadStore.setData('track', props.data as Track[]);
  }

  setupObserver();
  if (hasRemainedData()) {
    window.addEventListener('resize', setupObserver);
  }
});

onBeforeUnmount(() => {
  stopLoadAll();
  window.removeEventListener('resize', setupObserver);
});
</script>

<style lang="scss" scoped>
section {
  @include verticalFlex(var(--root-gap-width-1));

  > .toolbar {
    @include flexContentCenter();

    > .toolbar-right {
      @include flexContentCenter();
      margin-left: auto;
      gap: var(--root-gap-width-1);

      .toggle {
        display: flex;
        padding: var(--root-gap-width-3) var(--root-gap-width-1);
        border-radius: 9999px;
        background-color: var(--root-bg-color-2);
        color: var(--root-text-color-light);
        font-size: 0.875rem;
        cursor: pointer;

        &.active {
          color: var(--root-text-color);
          background-color: var(--root-bg-color-4);
        }

        &:hover {
          background-color: var(--root-bg-color-5);
        }
      }
    }

    > a {
      &:last-child {
        margin-left: auto;
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  section {
    > .toolbar {
      justify-content: center;

      > .toolbar-right {
        &:has(> :only-child) {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
