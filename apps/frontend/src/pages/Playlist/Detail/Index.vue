<template>
  <Container :loading="loading">
    <div v-if="data" class="detail-container">
      <section class="title">
        <img
          v-fallback
          :src="imgMap.getPath('playlist', data.playlist)"
          @click.stop="openSourceImg(data.playlist, langStore.mainLang)"
          loading="lazy"
        />
        <div>
          <h1>
            {{ computedTitle }}
            <span :title="t('playlist.expired')">
              <SvgIcon
                type="expired"
                fill="#00ACC1"
                v-if="data.playlist.isexpired"
              ></SvgIcon
            ></span>
          </h1>
          <p v-if="computedGameTitle" class="text-light">{{ computedGameTitle }}</p>
          <p>{{ stringMap.getString(data.playlist, 'desc') }}</p>
        </div>
      </section>
      <section class="detail">
        <div class="switch">
          <span class="text-light">
            {{ t('playlist.trackCount', { count: computedTrackCount }) }} ·
            <template v-if="data.duration.hour">
              {{ data.duration.hour }}{{ t('common.hour') }} </template
            >{{ data.duration.minute }}{{ t('common.minute') }}
          </span>
          <div>
            <a
              class="toggle"
              :class="{ active: isShowGame }"
              :title="t('playlist.setting')"
              @click.stop="isShowGame = !isShowGame"
              v-if="data.playlist.type !== 'SPECIAL'"
            >
              <SvgIcon :type="isShowGame ? 'game' : 'game-hide'" height="1.5em"></SvgIcon>
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
          <template v-for="(group, i) in data.trackGroups">
            <template
              v-if="!i || trackLoader.displayData.value.length >= group.tracks[0].pidx"
            >
              <li
                v-if="data.playlist.type !== 'SPECIAL'"
                class="full-row"
                :hidden="!isShowGame"
              >
                <template v-if="group.game">
                  <router-link :to="`/game/${group.game.id}`" class="jump-link">
                    <img
                      v-fallback
                      :src="imgMap.getPath('game', group.game)"
                      loading="lazy"
                    />
                    <div>
                      <span>{{ stringMap.getString(group.game, 'title') }}</span>
                      <span class="text-light"
                        >{{ group.game.year }} · {{ group.game.hardware }}</span
                      >
                    </div>
                    <SvgIcon type="right"></SvgIcon>
                  </router-link>
                </template>
                <template v-else>
                  <a class="jump-link">{{ t(`playlist.type.SPECIAL`) }}</a>
                </template>
              </li>
              <template v-for="track in group.tracks" :key="track.id">
                <li v-if="trackLoader.displayData.value.length >= track.pidx">
                  <TrackItem
                    :data="track"
                    :idx="track.pidx"
                    :view-mode="trackViewMode"
                    :hideTag="true"
                    :from-game="group.game"
                  >
                  </TrackItem>
                </li>
              </template>
            </template>
          </template>
        </ul>
        <div ref="loadMoreRef" class="load-more display-sm"></div>
        <hr />
      </section>
      <footer>
        <a
          v-external-link
          class="outer-link"
          :href="`${OFFICIAL_URL}/${langStore.mainLang}/${route.path.slice(1)}`"
        >
          <SvgIcon type="link" height="1.5em"></SvgIcon>
          {{ t('official.site') }} • {{ t('common.playlist') }} • {{ computedTitle }}
        </a>
      </footer>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useGameStore, useLangStore } from '@/stores';
import { useNavigation } from '@/composables/useNavigation';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import SideNav from '@/components/SideNav/Index.vue';
import MultiSwitcher from '@/components/MultiSwitcher.vue';
import TrackItem from '@/components/TrackItem/Index.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { useLoadMore } from '@/composables/useLoadMore';
import {
  type PlaylistTrack,
  type DurationInfo,
  type PlaylistDetail,
  OFFICIAL_URL,
} from '@/types';
import { getPlaylistDetail } from '@/api';
import { openSourceImg, getTotalDuration } from '@/utils/data-utils';
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
const trackViewMode = ref<'grid' | 'list' | 'detail'>('detail');
const isShowGame = ref(true);
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
const computedGameTitle = computed(() => {
  if (!data.value) return '';
  if (['MULTIPLE', 'SPECIAL'].includes(data.value.playlist.type)) return '';
  const game = data.value?.trackGroups[0].game;
  if (!game) return '';
  return stringMap.getString(game, 'title');
});
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

useNavigation({
  template: {
    setup() {
      return () => {
        if (!data.value) return null;
        return h(SideNav, {
          data: {
            title: computedTitle.value,
            subTitle: computedPlaylistTypeText.value,
            imgUrl: imgMap.getPath('playlist', data.value.playlist),
            officialUrl: `${OFFICIAL_URL}/${langStore.mainLang}/${route.path.slice(1)}`,
          },
          options: [],
        });
      };
    },
  },
});

onMounted(async () => {
  await getDetail();
  trackLoader.resetData(data.value!.trackGroups.map((x) => x.tracks).flat());

  const setupObserver = () => {
    const isVisible = window.getComputedStyle(loadMoreRef.value!).display !== 'none';
    if (isVisible) {
      tracker.observe(loadMoreRef.value!);
    } else {
      tracker.disconnect();
      trackLoader.loadAll();
      window.removeEventListener('resize', setupObserver);
    }
  };

  setupObserver();
  if (trackLoader.hasRemainedData()) {
    window.addEventListener('resize', setupObserver);
  }
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
