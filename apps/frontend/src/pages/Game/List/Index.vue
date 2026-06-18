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
  <Container :loading="loading">
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
            <img v-fallback :src="game.$imgPath" loading="lazy" />
            <span>{{ game.$title }}</span>
          </router-link>
        </li>
      </ul>
    </section>
  </Container>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNavigation } from '@/composables/useNavigation';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import SideNav from '@/components/SideNav/Index.vue';
import { STORAGE_KEY, GameGroupBy, type GameGroup } from '@/types';
import { getGames } from '@/api';
import { useGameStore, useLangStore } from '@/stores';

const { t } = useI18n();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const gameDict: Record<
  GameGroupBy,
  { key: 'hardware' | 'release' | 'recent' | 'series'; content: GameGroup[] }
> = {
  PLATFORM: { key: 'hardware', content: [] },
  RELEASE: { key: 'release', content: [] },
  ADDED: { key: 'recent', content: [] },
  SERIES: { key: 'series', content: [] },
};
const selectedGroupBy = ref<GameGroupBy>('PLATFORM');
const gameGroups = ref<GameGroup[]>([]);
const selectRef = ref<HTMLElement>();
const groupRefs = ref<HTMLElement[]>([]);

const computedGameGroupBy = computed(() => {
  return GameGroupBy.map((x) => ({
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
    imgMap.setData('game', gameList);
    stringMap.setData(gameList, 'title');
    useGameStore().markAsInitialized();
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
  window.scrollTo(0, 0);
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
