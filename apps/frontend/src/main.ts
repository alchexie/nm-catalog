import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './routers';
import fallbackImage from './plugins/fallbackImage';
import externalLink from './plugins/externalLink';
import { i18n } from './i18n';
import { useLangStore } from './stores';
import 'virtual:svg-icons-register';

import '@/styles/global.scss';

const app = createApp(App)
  .use(createPinia())
  .use(router)
  .use(fallbackImage)
  .use(externalLink)
  .use(i18n);

const langStore = useLangStore();
langStore.setLocale(langStore.locale);

app.mount('#app');
