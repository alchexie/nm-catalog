<template>
  <button
    ref="btnRef"
    class="track-detail-button"
    @click.stop="compultedIsMenuOpen ? closeMenu() : openMenu()"
  >
    <SvgIcon type="menu" width="24px"></SvgIcon>
  </button>
  <div
    v-if="compultedIsMenuOpen"
    ref="menuRef"
    class="track-detail-menu"
    :style="menuPosition"
  >
    <a
      v-external-link
      :href="`${OFFICIAL_URL}/shared/${langStore.mainLang}/JP/tracks/${props.data.id}`"
      @click.stop="closeMenu()"
    >
      <SvgIcon type="link" width="24px"></SvgIcon>
      <span class="menu-item-label">{{ t('track.menu.goShareLink') }}</span>
    </a>
    <button class="open-drawer" @click.stop="openDrawer()">
      <SvgIcon type="playlist" width="24px"></SvgIcon>
      <span class="menu-item-label">{{ t('track.menu.inPlaylist') }}</span>
      <SvgIcon type="right" width="1em"></SvgIcon>
    </button>
  </div>
  <Transition name="drawer-slide">
    <aside
      v-if="activeTrack?.id === props.data.id"
      class="track-detail-drawer"
      :style="{
        '--drawer-bg': `url(${imgMap.getPath('track', props.data, langStore.mainLang)})`,
      }"
      @click.stop=""
    >
      <header>
        <h1>
          {{ 'pidx' in props.data ? props.data.pidx : props.data.idx }}.
          {{ stringMap.getString(props.data, 'title', langStore.mainLang) }}
        </h1>
        <button class="close" @click.stop="trackViewStore.setActiveTrack(null)">
          <SvgIcon type="close" width="1.25em"></SvgIcon>
        </button>
      </header>
      <main>
        <div class="img">
          <img
            v-fallback
            :src="imgMap.getPath('track', props.data, langStore.mainLang)"
          />
        </div>
        <p class="title">
          {{ stringMap.getString(props.data, 'title', langStore.mainLang) }}
          <br />
          <span class="text-light">
            {{
              props.data.gid &&
              stringMap.getString(props.data.gid, 'title', langStore.mainLang)
            }}
          </span>
        </p>
        <section class="playlist">
          <h2>{{ t('track.menu.inPlaylist') }}</h2>
          <LoadingContainer :loading="loading">
            <ul>
              <li
                v-for="playlist in playlists"
                :key="playlist.id"
                :class="{ expired: playlist.isexpired }"
              >
                <router-link :to="`/playlist/${playlist.id}`">
                  <div class="img">
                    <img
                      v-fallback
                      :src="imgMap.getPath('playlist', playlist, langStore.mainLang)"
                    />
                  </div>
                  <div class="title">
                    <span>
                      <span class="text">
                        {{ stringMap.getString(playlist, 'title', langStore.mainLang) }}
                      </span>
                      <SvgIcon
                        type="expired"
                        fill="#00ACC1"
                        v-if="playlist.isexpired"
                      ></SvgIcon>
                    </span>
                    <span class="text-light">
                      {{
                        playlist.type === 'SINGLE_GAME' && props.data.gid
                          ? stringMap.getString(
                              props.data.gid,
                              'title',
                              langStore.mainLang
                            )
                          : ''
                      }}
                    </span>
                  </div>
                </router-link>
              </li>
              <li class="blank" v-if="!playlists?.length">{{ t('info.blank') }}</li>
            </ul>
          </LoadingContainer>
        </section>
      </main>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/base/SvgIcon.vue';
import LoadingContainer from '@/components/base/LoadingContainer.vue';

import { computed, nextTick, onActivated, onDeactivated, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useLangStore, usePreloadStore, useTrackViewStore } from '@/stores';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { useImgMap } from '@/composables/useImgMap';
import { useRequest } from '@/composables/useRequest';
import type { Playlist, PlaylistTrack, Track } from '@nm-catalog/shared';
import { OFFICIAL_URL } from '@/types';
import { getPlaylistByGame, getPlaylistsByTrack } from '@/api';

const props = defineProps<{
  data: Track | PlaylistTrack;
}>();

const { t } = useI18n();
const langStore = useLangStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const { loading, request } = useRequest();
const trackViewStore = useTrackViewStore();

const { activeTrack, menuTrack } = storeToRefs(trackViewStore);
const menuPosition = ref<Record<string, string>>({});
const wasDrawerOpen = ref(false);
const btnRef = ref<HTMLElement>();
const menuRef = ref<HTMLElement>();
const playlists = ref<Playlist[] | null>(null);

const compultedIsMenuOpen = computed(() => menuTrack.value?.id === props.data.id);

onActivated(() => {
  if (wasDrawerOpen.value) {
    wasDrawerOpen.value = false;
    trackViewStore.setActiveTrack(props.data);
  }
});

onDeactivated(() => {
  const isDrawerOpen = activeTrack.value?.id === props.data.id;
  wasDrawerOpen.value = isDrawerOpen;
  if (isDrawerOpen) {
    trackViewStore.setActiveTrack(null);
  }
  if (compultedIsMenuOpen.value) {
    trackViewStore.setMenuTrack(null);
  }
});

watch(compultedIsMenuOpen, (value) => {
  if (value) {
    document.addEventListener('click', closeMenu);
  } else {
    document.removeEventListener('click', closeMenu);
  }
});

function openMenu() {
  trackViewStore.setMenuTrack(props.data);
  nextTick(() => {
    const btn = btnRef.value;
    const menu = menuRef.value;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const margin = 8;
    const gap = 4;
    const drawerWidth = activeTrack.value
      ? Math.min(
          Number.parseFloat(
            window.getComputedStyle(document.documentElement).getPropertyValue('--drawer-width')
          ) || 0,
          window.innerWidth * 0.9
        )
      : 0;
    const drawerLeft = window.innerWidth - drawerWidth;
    let top = rect.bottom + gap;
    let left = rect.left;
    if (top + menuRect.height > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - gap - menuRect.height);
    }
    const menuMaxRight = Math.min(window.innerWidth, drawerLeft) - margin;
    if (left + menuRect.width > menuMaxRight) {
      left = Math.max(margin, rect.right - menuRect.width);
    }
    menuPosition.value = { top: `${top}px`, left: `${left}px` };
  });
}

function closeMenu() {
  trackViewStore.setMenuTrack(null);
}

async function openDrawer() {
  closeMenu();
  trackViewStore.setActiveTrack(props.data);

  if (playlists.value) return;
  const preloadStore = usePreloadStore();
  const playlistList = (await preloadStore.ensureLoaded('playlist')) as Playlist[];
  const playlistIndex = new Map(playlistList.map((x, i) => [x.id, i]));
  playlists.value = await request(getPlaylistsByTrack(props.data.id));
  playlists.value.sort((a, b) => {
    const aOrdered = a.type === 'MULTIPLE' || a.type === 'SPECIAL';
    const bOrdered = b.type === 'MULTIPLE' || b.type === 'SPECIAL';
    if (aOrdered && bOrdered) {
      const aRelated = a.type === 'MULTIPLE' && a.isrelatedgame === 1;
      const bRelated = b.type === 'MULTIPLE' && b.isrelatedgame === 1;
      if (aRelated !== bRelated) {
        return aRelated ? -1 : 1;
      }
      return (playlistIndex.get(a.id) ?? 0) - (playlistIndex.get(b.id) ?? 0);
    }
    return 0;
  });
  if (props.data.gid) {
    const gamePlaylists = await request(getPlaylistByGame(props.data.gid));
    preloadStore.setData('playlist', gamePlaylists);
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
