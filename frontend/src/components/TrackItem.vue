<template>
  <div class="common-detail" :class="{ hidden: hidden }">
    <div class="detail-part detail-image">
      <img
        v-fallback
        :src="imgMap.getPath('track', data)"
        @click.stop="openSourceImg(data, langStore.mainLang)"
        loading="lazy"
      />
    </div>
    <div class="detail-part detail-text">
      <h3 class="prefix-text text-main">
        {{ idx ?? data.idx }}.&nbsp;
        <span>
          {{ stringMap.getString(data, 'title') }}
          <small>({{ data.duration }})</small>
          <span class="track-game" v-if="showGameInfo">
            {{ stringMap.getString(data.gid!, 'title') }}
          </span>
        </span>
        <div class="tag" v-if="!hideTag">
          <SvgIcon type="star" :class="{ active: data.isbest }"></SvgIcon>
          <SvgIcon type="repeat" :class="{ active: data.isloop }"></SvgIcon>
        </div>
      </h3>
      <ul class="text-else" v-if="!showGameInfo">
        <li v-for="lang of computedLangs" :key="lang" class="prefix-text">
          <b>{{ lang }}</b> {{ stringMap.getString(data, 'title', lang) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLangStore } from '@/stores';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import SvgIcon from '@/components/SvgIcon.vue';
import type { Track } from '@/types';
import { isShowTitle, openSourceImg } from '@/utils/data-utils';

const props = defineProps<{
  data: Track;
  idx?: number;
  hidden?: boolean;
  hideTag?: boolean;
  showGameInfo?: boolean;
}>();

const langStore = useLangStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const computedLangs = computed(() =>
  langStore.langList.filter((x) => isShowTitle(props.data, x))
);
</script>

<style lang="scss" scoped>
h3:has(.tag) {
  padding-right: 3em;
}

.tag {
  position: absolute;
  top: 0.45em;
  right: 0.5em;
  display: flex;
  align-items: flex-start;
  height: 100%;

  .svg-icon {
    margin-left: 0.3em;
    opacity: 0.2;
    transform: translateY(-0.2em);

    &.active {
      opacity: 0.5;
    }
  }
}

.track-game {
  display: block;
  margin-top: 0.8rem;
  opacity: 0.5;
  font-weight: normal;
}

@media (prefers-color-scheme: light) {
  .tag {
    .svg-icon {
      color: $root-linkColor;
      opacity: 0.4;

      &.active {
        opacity: 1;
      }
    }
  }
}

@media (max-width: 767px) {
  .tag {
    .svg-icon {
      display: none;
    }
  }
}
</style>
