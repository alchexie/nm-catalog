<template>
  <div id="select" class="display-sm">
    <select
      name="groupby"
      v-model="selectedGroupBy"
      @change="onGroupByChange"
      ref="selectRef"
    >
      <option
        v-for="groupBy in computedGameGroupBy"
        :key="groupBy.value"
        :value="groupBy.value"
      >
        {{ groupBy.label }}
      </option>
    </select>
  </div>
  <LoadingContainer :loading="loading" full-height>
    <section
      v-for="(group, i) in computedGameGroups"
      :key="group.name"
      :ref="
        (el) => {
          if (el) {
            groupRefs[i] = el as HTMLElement;
          }
        }
      "
    >
      <h1>
        {{
          group.name ??
          (group.localeNameTag && t(group.localeNameTag)) ??
          group.localeNames[computedMainLang]
        }}
      </h1>
      <ul class="commom-grid">
        <li class="commom-grid-item" v-for="game in group.games" :key="game.id">
          <router-link :to="`/game/${game.id}`" :title="game.$title">
            <img v-fallback :src="game.$imgPath" />
            <span>{{ game.$title }}</span>
          </router-link>
        </li>
      </ul>
    </section>
  </LoadingContainer>
</template>

<script setup lang="ts">
import LoadingContainer from '@/components/base/LoadingContainer.vue';
import SideNav from '@/components/display/SideNav/Index.vue';

import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLangStore, usePreloadStore } from '@/stores';
import { useNavigation } from '@/composables/useNavigation';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { getGames } from '@/api';
import { STORAGE_KEY, GAME_GROUP_BY, type GameGroup, type GameGroupBy } from '@/types';
import { scrollToY } from '@/utils/dom-utils';

const { t } = useI18n();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();

const selectedGroupBy = ref<GameGroupBy>('PLATFORM');
const gameGroups = ref<GameGroup[]>([]);
const selectRef = ref<HTMLElement>();
const groupRefs = ref<HTMLElement[]>([]);

const computedGameGroupBy = computed(() => {
  return GAME_GROUP_BY.map((x) => ({
    label: t(`game.groupBy.${x}`),
    value: x,
  }));
});
const computedGameGroups = computed(() =>
  gameGroups.value.map((x) => ({
    ...x,
    games: x.games.map((y) => ({
      ...y,
      $title: stringMap.getString(y, 'title'),
      $imgPath: imgMap.getPath('game', y),
    })),
  }))
);
const computedGroupList = computed(() =>
  computedGameGroups.value.map((x) => ({
    label:
      x.name ??
      (x.localeNameTag && t(x.localeNameTag)) ??
      x.localeNames[computedMainLang.value],
    count: x.games.length,
  }))
);
const computedMainLang = computed(() => useLangStore().mainLang);

const gameDict: Record<
  GameGroupBy,
  { key: 'hardware' | 'release' | 'recent' | 'series'; content: GameGroup[] }
> = {
  PLATFORM: { key: 'hardware', content: [] },
  RELEASE: { key: 'release', content: [] },
  ADDED: { key: 'recent', content: [] },
  SERIES: { key: 'series', content: [] },
};

useNavigation({
  template: {
    setup() {
      return () => {
        if (!computedGameGroups.value.length) return null;
        return h(SideNav, {
          data: {
            title: t('common.game'),
          },
          sortConfig: {
            options: computedGameGroupBy.value,
            current: selectedGroupBy.value,
          },
          'onUpdate:sort'(val: GameGroupBy) {
            selectedGroupBy.value = val;
            changeGroupBy(val);
          },
          options: computedGroupList.value,
          targetNodes: groupRefs.value,
        });
      };
    },
  },
});

onMounted(async () => {
  await onGroupByChange();
});

async function getGamesByGroup(groupBy: GameGroupBy): Promise<GameGroup[]> {
  const target = gameDict[groupBy];
  if (target.content.length > 0) {
    return target.content;
  }

  const result = await request(getGames(target.key));
  target.content = result;

  if (!gameGroups.value.length) {
    const gameList = result.map((x) => x.games).reduce((a, b) => [...a, ...b]);
    await usePreloadStore().ensureLoaded('game', gameList);
  }

  return result;
}

async function onGroupByChange(event?: Event) {
  let value = '';
  if (!event) {
    const cache = localStorage.getItem(STORAGE_KEY.GAME_GROUPBY);
    value = cache ?? selectedGroupBy.value;
    selectedGroupBy.value = value as GameGroupBy;
  } else {
    value = (event.target as HTMLSelectElement).value;
  }
  gameGroups.value = await getGamesByGroup(value as GameGroupBy);
  localStorage.setItem(STORAGE_KEY.GAME_GROUPBY, value);

  groupRefs.value = [];
  scrollToY(0);
}

function changeGroupBy(value: GameGroupBy) {
  if (!selectRef.value) {
    return;
  }
  (selectRef.value as HTMLSelectElement).value = value;
  selectRef.value.dispatchEvent(new Event('change', { bubbles: true }));
}
</script>

<style lang="scss" scoped>
#select {
  width: 100%;
  padding: 1rem 0 2rem;
  text-align: right;
}

section {
  margin-bottom: calc(var(--root-gap-width-0) * 2);

  h1 {
    margin: 0;
    margin-bottom: var(--root-gap-width-0);
    font-size: 1.125rem;
  }
}
</style>
