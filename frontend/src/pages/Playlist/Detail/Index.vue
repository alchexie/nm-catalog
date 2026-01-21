<template>
  <Container :loading="loading">
    <main id="detial-main" v-if="data">
      <section class="common-detail main">
        <div class="detail-part detail-image">
          <img
            v-fallback
            :src="imgMap.getPath('playlist', data.playlist)"
            @click.stop="openSourceImg(data.playlist, langStore.mainLang)"
            loading="lazy"
          />
        </div>
        <div class="detail-part detail-text">
          <h1 class="text-main" ref="titleRef">
            {{ computedTitle }}<br />
            <small> {{ computedPlaylistTypeText }}</small>
          </h1>
          <ul class="text-else">
            <li>
              {{ t('playlist.trackCount', { count: computedTrackCount }) }} ·
              <template v-if="data.duration.hour"
                >{{ data.duration.hour }}{{ t('common.hour') }}</template
              >
              {{ data.duration.minute }}{{ t('common.minute') }}
            </li>
            <li>{{ stringMap.getString(data.playlist, 'desc') }}</li>
          </ul>
        </div>
      </section>
      <section class="detail">
        <template v-for="(group, index) in data.trackGroups">
          <template
            v-if="!index || trackLoader.displayData.value.length >= group.tracks[0].pidx"
          >
            <h2 v-if="group.game">
              <router-link :to="`/game/${group.game.id}`">
                <img
                  v-fallback
                  :src="imgMap.getPath('game', group.game)"
                  loading="lazy"
                />
                {{ stringMap.getString(group.game, 'title') }}
              </router-link>
            </h2>
            <template v-for="track in group.tracks" :key="track.id">
              <TrackItem
                v-if="trackLoader.displayData.value.length >= track.pidx"
                :data="track"
                :idx="track.pidx"
                :hideTag="true"
                :showGameInfo="computedIsChangalbePlaylist"
              >
              </TrackItem>
            </template>
          </template>
        </template>
        <div ref="loadMoreRef" class="load-more"></div>
      </section>
    </main>
  </Container>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useGameStore, useLangStore } from '@/stores';
import { useHeader } from '@/composables/useHeader';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import TrackItem from '@/components/TrackItem.vue';
import { type PlaylistTrack, type DurationInfo, type PlaylistDetail } from '@/types';
import { openSourceImg, getTotalDuration } from '@/utils/data-utils';
import { getPlaylistDetail } from '@/api';
import { useLoadMore } from '@/composables/useLoadMore';
import { ElementTracker } from '@/utils/element-tracker';

const { t } = useI18n();
const route = useRoute();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const trackLoader = useLoadMore<PlaylistTrack>([]);
const pid = route.params.pid as string;
const langStore = useLangStore();
const data = ref<PlaylistDetail & { duration: DurationInfo }>();
const titleRef = ref<HTMLElement>();
const loadMoreRef = ref<HTMLElement>();
const tracker = new ElementTracker(async (entries) => {
  const entry = entries[0];
  if (entry.isIntersecting) {
    await trackLoader.loadMore();
    if (!trackLoader.hasRemainedData()) {
      tracker.disconnect();
    }
  }
});

const computedTitle = computed(() => stringMap.getString(data.value!.playlist, 'title'));
const computedPlaylistTypeText = computed(
  () =>
    data.value &&
    t(`playlist.type.${data.value.playlist.type}`, {
      gameTitle:
        data.value.trackGroups[0].game &&
        stringMap.getString(data.value.trackGroups[0].game, 'title'),
    })
);
const computedTrackCount = computed(() => {
  return (
    data.value?.playlist.tracksnum ||
    data.value?.trackGroups.map((x) => x.tracks.length).reduce((a, b) => a + b)
  );
});
const computedIsChangalbePlaylist = computed(() => {
  const playlist = data.value?.playlist;
  return (
    playlist &&
    playlist.type !== 'SPECIAL' &&
    (!playlist.isrelatedgame || !playlist.tracksnum)
  );
});

useHeader(() => ({
  observeRef: titleRef.value,
  data: data.value,
  template: () => {
    if (data.value) {
      return [
        h('h1', computedTitle.value),
        h('small', ` (${computedPlaylistTypeText.value})`),
      ];
    } else {
      return [];
    }
  },
}));

onMounted(async () => {
  await getDetail();
  trackLoader.resetData(data.value!.trackGroups.map((x) => x.tracks).flat());
  tracker.observe(loadMoreRef.value as HTMLElement);
});

async function getDetail() {
  const result = await request(getPlaylistDetail(pid));
  const playlist = result.playlist;
  const games = result.trackGroups.filter((x) => x.game).map((x) => x.game!);
  const tracks = result.trackGroups.map((x) => x.tracks).flat(1);
  imgMap.setData('playlist', [playlist]).setData('game', games).setData('track', tracks);
  stringMap
    .setData([result.playlist, ...games, ...tracks], 'title')
    .setData([result.playlist], 'desc');
  data.value = { ...result, duration: getTotalDuration(tracks) };

  if (computedIsChangalbePlaylist.value) {
    useGameStore().markAsInitialized(true);
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
