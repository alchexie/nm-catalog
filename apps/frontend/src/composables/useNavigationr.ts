import { onActivated } from 'vue';
import { useNavigationStore, type NavigationConfig } from '@/stores';

export const useNavigationr = (config?: NavigationConfig | (() => NavigationConfig)) => {
  const navigationrStore = useNavigationStore();

  onActivated(() => {
    const getConfig = () => (typeof config === 'function' ? config() : config);
    const cfg = getConfig();
    if (cfg) {
      if (cfg.template) {
        navigationrStore.set(cfg);
      }
    } else {
      navigationrStore.clear();
    }
  });

  return { navigationrStore };
};
