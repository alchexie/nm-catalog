import { onActivated } from 'vue';
import { useNavigationStore, type NavigationConfig } from '@/stores';

const scrollMap = new Map<string, number>();

const setRouteScroll = (route: string, scrollTop: number) => {
  scrollMap.set(route, scrollTop);
};

const getRouteScroll = (route: string): number => {
  return scrollMap.get(route) ?? 0;
};

export const useNavigation = (config?: NavigationConfig | (() => NavigationConfig)) => {
  const navigationStore = useNavigationStore();

  onActivated(() => {
    const getConfig = () => (typeof config === 'function' ? config() : config);
    const cfg = getConfig();
    if (cfg) {
      if (cfg.template) {
        navigationStore.setTemplate(cfg);
      }
    } else {
      navigationStore.clearTemplate();
    }
  });

  return { navigationStore, setRouteScroll, getRouteScroll };
};
