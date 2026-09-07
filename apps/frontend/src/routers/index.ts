import { createRouter, createWebHistory } from 'vue-router';
import GameListComponent from '@/pages/Game/List/Index.vue';
import GameDetailComponent from '@/pages/Game/Detail/Index.vue';
import PlaylistListComponent from '@/pages/Playlist/List/Index.vue';
import PlaylistDetailComponent from '@/pages/Playlist/Detail/Index.vue';
import { STORAGE_KEY } from '@/types';
import { getScrollContainer, getScrollTop } from '@/utils/dom-utils';

const routes = [
  {
    path: '/',
    redirect: () => {
      const first = localStorage.getItem(STORAGE_KEY.FIRST);
      return first ?? '/game';
    },
  },
  { path: '/game', component: GameListComponent },
  { path: '/game/:gid', component: GameDetailComponent },
  { path: '/playlist', component: PlaylistListComponent },
  { path: '/playlist/:pid', component: PlaylistDetailComponent },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const scrollPositions = new Map<string, number>();

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    getScrollContainer().scrollTo(0, scrollPositions.get(to.fullPath) ?? 0);
  },
});

router.beforeEach((to, from) => {
  if (from.fullPath && from.fullPath !== to.fullPath) {
    scrollPositions.set(from.fullPath, getScrollTop());
  }
});

router.afterEach(({ path }) => {
  if (['/game', '/playlist'].includes(path)) {
    localStorage.setItem(STORAGE_KEY.FIRST, path);
  }
});

export default router;
