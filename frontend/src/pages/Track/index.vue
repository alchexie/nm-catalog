<template>
  <Header :observeRef="titleRef">
    <template v-if="data">
      {{ getLangTitle(data.game, store.mainLang) }}
      <small>({{ data.game.year }} | {{ data.game.hardware }})</small>
    </template>
  </Header>
  <div class="loading" v-if="loading"></div>
  <template v-else>
    <main id="main" v-if="data">
      <section class="game">
        <img
          :src="gameImgMap.get(store.mainLang)?.get(data.game.id)"
          @click.stop="openSourceImg(data.game, store.mainLang)"
          loading="lazy"
        />
        <div>
          <h2 ref="titleRef">
            {{ getLangTitle(data.game, store.mainLang) }}<br />
            <small>{{ data.game.year }} | {{ data.game.hardware }}</small>
          </h2>
          <ul>
            <li
              v-for="lang of store.langList.filter((x) => isShowTitle(data!.game, x.id))"
              :key="lang.id"
            >
              <b>{{ lang.id }}</b> {{ getLangTitle(data.game, lang.id) }}
            </li>
          </ul>
        </div>
      </section>
      <nav class="tabs">
        <div
          v-for="(value, key) in GameDataSection"
          :key="key"
          class="tab"
          :class="{ active: gameDataSection === key, blank: !(data as any)[`${key.toLocaleLowerCase()}s`]?.length }"
          @click.stop="gameDataSection = key"
        >
          {{ (data as any)[`${key.toLocaleLowerCase()}s`]?.length }} {{ value }}
        </div>
      </nav>
      <section class="detail">
        <section :hidden="gameDataSection !== 'TRACK'">
          <div class="radio-group">
            <label
              v-for="(label, key) in TrackMode"
              :key="key"
              :class="{ disabled: !getTrackCount(key) }"
            >
              <input
                type="radio"
                :value="key"
                v-model="trackMode"
              />
              <span>{{ label }} ({{ getTrackCount(key) }})</span>
            </label>
          </div>
          <ol>
            <li
              v-for="track in data.tracks"
              :key="track.idx"
              :class="{
                hidden:
                  (trackMode === 'TOP' && !track.isbest) ||
                  (trackMode === 'LOOP' && !track.isloop),
              }"
            >
              <div>
                <img
                  :src="trackImgMap?.get(store.mainLang)?.get(track.id)"
                  @click.stop="openSourceImg(track, store.mainLang)"
                  loading="lazy"
                />
              </div>
              <div>
                <h4>
                  {{ track.idx }}. {{ getLangTitle(track, store.mainLang) }}
                  <small>({{ track.duration }})</small>
                  <div class="tag">
                    <SvgIcon type="star" :class="{ active: track.isbest }"></SvgIcon>
                    <SvgIcon type="repeat" :class="{ active: track.isloop }"></SvgIcon>
                  </div>
                </h4>
                <ul>
                  <li
                    v-for="lang of store.langList.filter((x) => isShowTitle(track, x.id))"
                    :key="lang.id"
                  >
                    <b>{{ lang.id }}</b> {{ getLangTitle(track, lang.id) }}
                  </li>
                </ul>
              </div>
            </li>
          </ol>
        </section>
        <section :hidden="gameDataSection !== 'RELATED'">
          <ol>
            <li v-for="relate in data.relateds" :key="relate.id">
              <div>
                <img
                  :src="gameImgMap?.get(store.mainLang)?.get(relate.id)"
                  @click.stop="openSourceImg(relate, store.mainLang)"
                  loading="lazy"
                />
              </div>
              <div>
                <h4>
                  <router-link :to="`/${relate.id}`">
                    {{ getLangTitle(relate, store.mainLang) }}</router-link
                  >
                  <small class="xs-visible"
                    >({{ relate.year }} | {{ relate.hardware }})</small
                  >
                </h4>
                <p>{{ relate.year }} | {{ relate.hardware }}</p>
              </div>
            </li>
          </ol>
        </section>
      </section>
    </main>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useStore } from '@/stores';
import Header from '@/components/Header.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { GameDataSection, TrackMode, type GameDetail } from '@/types';
import { getLangTitle, isShowTitle, getImgSrc, openSourceImg } from '@/utils/data-utils';

defineOptions({ name: 'Track' });

const route = useRoute();
const gid = route.params.gid as string;
const store = useStore();
const data = ref<GameDetail>();
const gameDataSection = ref<GameDataSection>('TRACK');
const gameImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const trackImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const loading = ref<boolean>(false);
const titleRef = ref<HTMLElement>();
const trackMode = ref<TrackMode>('ALL');

onMounted(async () => {
  await getDetail();
});

async function getDetail() {
  loading.value = true;
  try {
    const res = await axios.get(`/api/game/${gid}/detail`);
    data.value = res.data;
    if (!data.value) {
      return;
    }

    for (const lang of store.langList) {
      let imgMap = new Map<string, string>();
      imgMap.set(data.value.game.id, getImgSrc(data.value.game, lang.id));
      gameImgMap.value.set(lang.id, imgMap);

      if (!trackImgMap.value.has(lang.id)) {
        imgMap = new Map<string, string>();
        for (const track of data.value.tracks) {
          imgMap.set(track.id, getImgSrc(track, lang.id));
        }
        trackImgMap.value.set(lang.id, imgMap);
      }
    }

    for (const lang of store.langList) {
      const imgMap = gameImgMap.value.get(lang.id);
      for (const game of data.value.relateds) {
        imgMap?.set(game.id, getImgSrc(game, lang.id));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function getTrackCount(mode: TrackMode): number {
  switch (mode) {
    case 'ALL':
      return data.value!.tracks.length;
    case 'TOP':
      return data.value!.tracks.filter((x) => x.isbest).length;
    case 'LOOP':
      return data.value!.tracks.filter((x) => x.isloop).length;
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
