import type { App } from 'vue';

export default {
  install(app: App): void {
    app.directive('external-link', {
      mounted(el: HTMLAnchorElement) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
        el.setAttribute('referrerpolicy', 'no-referrer');
      },
    });
  },
};
