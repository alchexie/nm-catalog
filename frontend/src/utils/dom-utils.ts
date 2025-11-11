export const scrollToY = (targetY: number, callback?: (...args: any[]) => any) => {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const startTime = performance.now();
  const duration = 300;

  function animate(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY + diff * ease);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (callback) {
        callback();
      }
    }
  }

  requestAnimationFrame(animate);
};
