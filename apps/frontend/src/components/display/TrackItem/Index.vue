<template>
  <div class="track-container" :class="props.viewMode">
    <div class="img hidden-sm">
      <img
        v-fallback
        :src="imgMap.getPath('track', data)"
        @click.stop="openSourceImg(data, langStore.mainLang)"
        loading="lazy"
        :title="
          fromGame &&
          `${stringMap.getString(data, 'title')} - ${stringMap.getString(fromGame, 'title')}`
        "
      />
    </div>
    <div class="info">
      <p>
        <span class="badge text-bold">
          {{ idx ?? (data as PlaylistTrack).pidx ?? data.idx }}
        </span>
        <span>
          {{ stringMap.getString(data, 'title') }}
        </span>
        <span class="text-light">{{ data.duration }}</span>
      </p>
      <div class="hidden-sm">
        <ul v-show="props.viewMode === 'detail'">
          <li v-for="lang of computedLangs" :key="lang">
            <SvgIcon :type="`lang-${lang}`" width="3em" height="1.5em"></SvgIcon>
            <span>{{ stringMap.getString(data, 'title', lang) }}</span>
          </li>
        </ul>
        <span class="tag" v-if="!hideTag" v-show="props.viewMode === 'detail'">
          <SvgIcon type="star" :class="{ active: data.isbest }"></SvgIcon>
          <SvgIcon type="extend" :class="{ active: data.isloop }"></SvgIcon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/base/SvgIcon.vue';

import { computed } from 'vue';
import { useLangStore } from '@/stores';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game, PlaylistTrack, Track } from '@/types';
import { isShowTitle, openSourceImg } from '@/utils/data-utils';

const props = defineProps<{
  data: Track | PlaylistTrack;
  idx?: number;
  viewMode: 'grid' | 'list' | 'detail';
  hideTag?: boolean;
  fromGame?: Game;
}>();

const langStore = useLangStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const computedLangs = computed(() =>
  langStore.langList.filter((x) => isShowTitle(props.data, x))
);
</script>

<style lang="scss" scoped src="./styles.scss"></style>
