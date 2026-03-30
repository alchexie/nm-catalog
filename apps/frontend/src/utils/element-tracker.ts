export class ElementTracker {
  private _observer!: IntersectionObserver;
  private _isActive = false;
  private _observeEl!: HTMLElement[];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit | undefined
  ) {
    this._observer = new IntersectionObserver(
      callback,
      Object.assign({ root: null, threshold: 0 }, options ?? {})
    );
  }

  observe(target: HTMLElement | HTMLElement[]) {
    if (!Array.isArray(target)) {
      this._observer.observe(target);
      this._observeEl = [target];
    } else {
      target.forEach((el: HTMLElement) => {
        el && this._observer.observe(el);
      });
      this._observeEl = target;
    }
    this._isActive = true;
  }

  disconnect() {
    if (this._isActive) {
      this._observer.disconnect();
    }
    this._isActive = false;
  }

  reconnect() {
    this.observe(this._observeEl);
    this._isActive = true;
  }
}
