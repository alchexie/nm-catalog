export const getScrollContainer = (): HTMLElement | Window => {
  const mainContainer = document.getElementById('main-container');
  if (mainContainer instanceof HTMLElement) {
    const style = window.getComputedStyle(mainContainer);
    if (style.overflowY === 'auto' && mainContainer.scrollHeight > mainContainer.clientHeight) {
      return mainContainer;
    }
  }
  return window;
};

export const getScrollTop = (): number => {
  const container = getScrollContainer();
  return 'scrollTop' in container ? container.scrollTop : container.scrollY;
};

export const scrollToY = (targetY: number, callback?: (...args: any[]) => any) => {
  const container = getScrollContainer();
  const startY = getScrollTop();
  const diff = targetY - startY;
  const startTime = performance.now();
  const duration = 300;

  function animate(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    container.scrollTo(0, startY + diff * ease);

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
