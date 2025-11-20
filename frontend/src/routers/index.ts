import { createRouter, createWebHistory } from 'vue-router';
import HomeComponent from '@/pages/Home';
import DetailComponent from '@/pages/Detail';
import PlaylistComponent from '@/pages/Playlist';
// import UploadComponent from '@/pages/Upload.vue';

const routes = [
  { path: '/', component: HomeComponent },
  { path: '/:gid', component: DetailComponent },
  { path: '/playlist/:pid', component: PlaylistComponent },
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
