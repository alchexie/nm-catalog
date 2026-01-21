import { nextTick, ref } from 'vue';

export const useLoadMore = <T>(data: T[], batchSize = 50) => {
  const displayData = ref<T[]>([]);
  let toDisplayData = [...data];
  let running = false;

  const resetData = (data: T[]) => {
    if (running) {
      return;
    }
    toDisplayData = [...data];
    displayData.value = [];
  };

  const loadMore = async () => {
    if (running) {
      return false;
    }
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

  return { displayData, resetData, loadMore, hasRemainedData };
};
