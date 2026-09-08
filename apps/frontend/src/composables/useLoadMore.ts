import { nextTick, ref } from 'vue';

export const useLoadMore = <T>(data: T[], batchSize = 50) => {
  const displayData = ref<T[]>([]);
  let toDisplayData = [...data];
  let running = false;

  const resetData = (data: T[]) => {
    if (running) return;

    toDisplayData = [...data];
    displayData.value = [];
  };

  const loadMore = async () => {
    if (running) return false;
    if (!toDisplayData.length) {
      return false;
    }
    running = true;
    const nextBatch = toDisplayData.splice(0, batchSize);
    (displayData.value as T[]).push(...nextBatch);
    await nextTick();
    running = false;
    return true;
  };

  const hasRemainedData = () => toDisplayData.length > 0;

  let batchTimer: ReturnType<typeof setInterval> | null = null;
  const loadAll = (onComplete?: () => void) => {
    if (batchTimer) return;

    batchTimer = setInterval(() => {
      if (!toDisplayData.length) {
        if (batchTimer) {
          clearInterval(batchTimer);
        }
        batchTimer = null;
        onComplete?.();
        return;
      }
      const nextBatch = toDisplayData.splice(0, batchSize);
      (displayData.value as T[]).push(...nextBatch);
    }, 50);
  };

  const stopLoadAll = () => {
    if (batchTimer) {
      clearInterval(batchTimer);
      batchTimer = null;
    }
  };

  return {
    displayData,
    resetData,
    loadMore,
    hasRemainedData,
    loadAll,
    stopLoadAll,
  };
};
