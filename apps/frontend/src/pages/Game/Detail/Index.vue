<template>
  <LoadingContainer :loading="loading">
    <div v-if="data" class="detail-container">
      <section class="title">
        <img
          v-fallback
          class="display-sm"
          :src="imgMap.getPath('game', data.game)"
          @click.stop="openSourceImg(data.game, langStore.mainLang)"
        />
        <p class="text-light">{{ data.game.year }} • {{ data.game.hardware }}</p>
        <h1>{{ computedTitle }}</h1>
      </section>
      <section class="brand hidden-sm">
        <ul>
          <li v-for="lang of computedLangs" :key="lang">
            <SvgIcon :type="`lang-${lang}`" width="3em" height="1.5em"></SvgIcon>
            <span> {{ stringMap.getString(data.game, 'title', lang) }}</span>
          </li>
        </ul>
        <div v-if="computedBrandImage">
          <div
            class="base"
            :style="{ 'background-image': `url(${computedBrandImage.compress})` }"
          ></div>
          <div class="blur"></div>
          <div
            class="front"
            :style="{ 'background-image': `url(${computedBrandImage.compress})` }"
          ></div>
          <div
            class="front"
            :style="{ 'background-image': `url(${computedBrandImage.original})` }"
          ></div>
        </div>
      </section>
      <nav class="tabs display-sm">
        <button
          v-for="item in computedSections"
          :key="item.key"
          class="tab"
          :class="{
            active: gameDataSection === item.key,
            blank: /(?<!\d)0(?!\d)/.test(item.label),
          }"
          @click.stop="gameDataSection = item.key"
        >
          {{ item.label }} ({{ item.count }})
        </button>
      </nav>
      <section class="detail">
        <div :hidden="gameDataSection !== 'TRACK'" :ref="(el) => setRefElement(el, 0)">
          <h2 class="hidden-sm">{{ t('game.dataSection.TRACK') }}</h2>
          <TrackView :data="data.tracks"></TrackView>
        </div>
        <div :hidden="gameDataSection !== 'PLAYLIST'" :ref="(el) => setRefElement(el, 1)">
          <h2 class="hidden-sm">{{ t('game.dataSection.PLAYLIST') }}</h2>
          <PlaylistView :data="data.playlists"></PlaylistView>
        </div>
        <div
          :hidden="gameDataSection !== 'RELATED'"
          :ref="(el) => setRefElement(el, 2)"
          v-if="data.relateds.length"
        >
          <h2 class="hidden-sm">{{ t('game.dataSection.RELATED') }}</h2>
          <RelatedView :data="data.relateds"></RelatedView>
        </div>
        <hr />
      </section>
      <footer>
        <a
          v-external-link
          class="outer-link"
          :href="`${OFFICIAL_URL}/${langStore.mainLang}/${route.path.slice(1)}`"
        >
          <SvgIcon type="link" height="1.5em"></SvgIcon>
          {{ t('official.site') }} • {{ t('common.game') }} • {{ computedTitle }}
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
import RelatedView from '@/components/display/RelatedView.vue';
import PlaylistView from '@/components/display/PlaylistView.vue';

import { computed, h, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useLangStore } from '@/stores';
import { useNavigation } from '@/composables/useNavigation';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { getGameDetail } from '@/api';
import {
  GameDataSections,
  OFFICIAL_URL,
  type GameDetail,
  type GameDataSection,
  type Track,
} from '@/types';
import { getSourceImg, isShowTitle, openSourceImg } from '@/utils/data-utils';

const { t } = useI18n();
const route = useRoute();
const langStore = useLangStore();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const gid = route.params.gid as string;
const data = ref<GameDetail>();
const gameDataSection = ref<GameDataSection>('TRACK');
const brandTrack = ref<Track>();
const groupRefs = ref<HTMLElement[]>([]);

const computedTitle = computed(() => stringMap.getString(data.value!.game, 'title'));
const computedLangs = computed(() =>
  langStore.langList.filter((x) => isShowTitle(data.value!.game, x))
);
const computedBrandImage = computed(() => {
  const rTrack = brandTrack.value;
  if (!rTrack) return;

  return {
    compress: imgMap.getPath('track', rTrack, langStore.mainLang),
    original: getSourceImg(rTrack, langStore.mainLang),
  };
});
const computedSections = computed(() => {
  const result = [];
  for (const section of GameDataSections) {
    result.push({
      key: section,
      label: t(`game.dataSection.${section}`),
      count: (data.value as any)[`${section.toLowerCase()}s`]?.length ?? 0,
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
            subTitle: `${data.value.game.year} • ${data.value.game.hardware}`,
            imgUrl: imgMap.getPath('game', data.value.game),
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
  await getDetail();
});

watch(
  () => langStore.mainLang,
  () => {
    if (data.value?.tracks.length) {
      brandTrack.value =
        data.value.tracks[Math.floor(Math.random() * data.value.tracks.length)];
    }
  }
);

async function getDetail() {
  const result = await request(getGameDetail(gid));
  imgMap.setData('game', [result.game]);
  stringMap.setData([result.game], 'title');
  brandTrack.value = result.tracks[Math.floor(Math.random() * result.tracks.length)];
  data.value = result;
}

function setRefElement(el: any, idx: number) {
  if (el) {
    groupRefs.value[idx] = el as HTMLElement;
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
