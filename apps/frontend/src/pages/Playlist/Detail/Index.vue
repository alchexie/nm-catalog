<template>
  <LoadingContainer :loading="loading" full-height>
    <div v-if="data" class="detail-container">
      <section class="title">
        <img
          v-fallback
          :src="imgMap.getPath('playlist', data.playlist)"
          @click.stop="openSourceImg(data.playlist, langStore.mainLang)"
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
        <div class="track" :ref="(el) => setRefElement(el, 0)">
          <TrackView
            :data="
              data.playlist.type !== 'SPECIAL'
                ? data.trackGroups
                : data.trackGroups[0].tracks
            "
            :group-mode="data.playlist.type !== 'SPECIAL'"
            playlist-mode
          />
        </div>
        <template v-if="data.relatedPlaylists">
          <router-link
            :to="`/playlist/${data.relatedPlaylists[0].id}`"
            class="jump-link hidden-sm"
            v-if="data.playlist.type !== 'SINGLE_GAME_ALL'"
          >
            <div>
              <span>
                {{ stringMap.getString(data.relatedPlaylists[0], 'title') }}
                <span class="text-light">({{ data.relatedPlaylists[0].tracksnum }})</span>
              </span>
              <span class="text-light">
                {{ stringMap.getString(data.trackGroups[0].game!, 'title') }}
              </span>
            </div>
            <SvgIcon type="right"></SvgIcon>
          </router-link>
          <div class="playlist hidden-sm" :ref="(el) => setRefElement(el, 1)">
            <h2>{{ t(`game.playlist.MULTIPLE`) }}</h2>
            <PlaylistView
              :data="data.relatedPlaylists"
              :belonging="
                data.relatedPlaylists && data.playlist.type !== 'MULTIPLE'
                  ? data.trackGroups[0].game
                  : undefined
              "
              no-group
              ref="playlistRef"
            ></PlaylistView>
          </div>
        </template>
        <template v-if="data.relatedGames">
          <div class="related hidden-sm" :ref="(el) => setRefElement(el, 1)">
            <h2 class="hidden-sm">{{ t('game.dataSection.RELATED') }}</h2>
            <RelatedView :data="data.relatedGames"></RelatedView>
          </div>
        </template>
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
  </LoadingContainer>
</template>

<script setup lang="ts">
import LoadingContainer from '@/components/base/LoadingContainer.vue';
import SvgIcon from '@/components/base/SvgIcon.vue';
import SideNav from '@/components/display/SideNav/Index.vue';
import TrackView from '@/components/display/TrackView.vue';
import PlaylistView from '@/components/display/PlaylistView.vue';
import RelatedView from '@/components/display/RelatedView.vue';

import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useLangStore, usePreloadStore } from '@/stores';
import { useNavigation } from '@/composables/useNavigation';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { getPlaylistDetail } from '@/api';
import { type PlaylistDetail, OFFICIAL_URL } from '@/types';
import { openSourceImg } from '@/utils/data-utils';

const { t } = useI18n();
const route = useRoute();
const { loading, request } = useRequest();
const langStore = useLangStore();
const preloadStore = usePreloadStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const pid = route.params.pid as string;
const data = ref<PlaylistDetail>();
const groupRefs = ref<HTMLElement[]>([]);
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
const computedSections = computed(() => {
  const result = [
    {
      key: 'TRACK',
      label: t(`game.dataSection.TRACK`),
      count: computedTrackCount.value ?? 0,
    },
  ];
  if (data.value?.relatedPlaylists) {
    result.push({
      key: 'PLAYLIST',
      label: t(`game.playlist.MULTIPLE`),
      count:
        data.value.relatedPlaylists[0].type === 'SINGLE_GAME_ALL'
          ? data.value.relatedPlaylists.length - 1
          : data.value.relatedPlaylists.length,
    });
  }
  if (data.value?.relatedGames) {
    result.push({
      key: 'RELATED',
      label: t(`game.dataSection.RELATED`),
      count: data.value.relatedGames.length,
    });
  }
  return result;
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
          options: computedSections.value,
          targetNodes: groupRefs.value,
        });
      };
    },
  },
});

onMounted(async () => {
  const result = await request(getPlaylistDetail(pid));
  const playlist = result.playlist;
  preloadStore.setData('playlist', [playlist]);
  if (result.relatedPlaylists) {
    result.relatedPlaylists = result.relatedPlaylists.filter(
      (x) => x.id !== result.playlist.id
    );
  }
  data.value = result;

  if (computedIsChangalbePlaylist.value) {
    await preloadStore.ensureGameData();
  }
});

function setRefElement(el: any, idx: number) {
  if (el) {
    groupRefs.value[idx] = el as HTMLElement;
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
