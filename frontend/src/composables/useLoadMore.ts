import { nextTick, ref } from 'vue';

export const useLoadMore = <T>(data: T[], batchSize = 50) => {
  const toDisplayData = [...data];
  const displayData = ref<T[]>([]);
  let running = false;

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

  return { displayData, loadMore, hasRemainedData };
};
