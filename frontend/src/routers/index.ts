import { createRouter, createWebHistory } from 'vue-router';
import HomeComponent from '@/pages/Home';
import DetailComponent from '@/pages/Detail';
// import UploadComponent from '@/pages/Upload.vue';

const routes = [
  { path: '/', component: HomeComponent },
  { path: '/:gid', component: DetailComponent },
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
