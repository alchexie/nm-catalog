import { defineStore } from 'pinia';
import { markRaw, type Component } from 'vue';

export interface NavigationConfig {
  template?: Component;
}

export const useNavigationStore = defineStore('navigation', {
  state: (): NavigationConfig => ({}),
  actions: {
    setTemplate(config: NavigationConfig) {
      this.template = config.template ? markRaw(config.template) : undefined;
    },
    clearTemplate() {
      this.template = undefined;
    },
  },
});
