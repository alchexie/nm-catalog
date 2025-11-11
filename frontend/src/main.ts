import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './styles/global.scss'
import App from './App.vue'
import router from './routers';
import 'virtual:svg-icons-register';

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app')
