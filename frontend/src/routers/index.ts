import { createRouter, createWebHistory } from 'vue-router';
import GameComponent from '@/pages/Game';
import TrackComponent from '@/pages/Track';
// import UploadComponent from '@/pages/Upload.vue';

const routes = [
  { path: '/', component: GameComponent },
  { path: '/:gid', component: TrackComponent },
  // { path: '/upload', component: UploadComponent },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
