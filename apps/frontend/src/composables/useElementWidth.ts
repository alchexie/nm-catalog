import type { Ref } from 'vue';
import { onMounted, onUnmounted, ref, watch } from 'vue';

export const useElementWidth = (el: Ref<HTMLElement | null | undefined>) => {
  const elementWidth = ref(0);
  const updateElementWidth = () => {
    if (el.value) {
      elementWidth.value = el.value.offsetWidth;
    }
  };

  onMounted(() => {
    updateElementWidth();
    window.addEventListener('resize', updateElementWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateElementWidth);
  });

  watch(
    () => el.value,
    () => {
      updateElementWidth();
    }
  );

  return elementWidth;
};
