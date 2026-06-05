import { defineStore } from 'pinia';
import type { Component } from 'vue';

export interface NavigationConfig {
  template?: Component;
}

export const useNavigationStore = defineStore('navigation', {
  state: (): NavigationConfig => ({}),
  actions: {
    set(config: NavigationConfig) {
      this.template = config.template;
    },
    clear() {
      this.template = undefined;
    },
  },
});
