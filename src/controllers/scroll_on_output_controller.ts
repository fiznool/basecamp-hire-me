import debounce from 'lodash/debounce';

import BaseController from '../base_controller';

const DEBOUNCE_THRESHOLD = 50;

export default class extends BaseController {
  public observer?: MutationObserver;

  public connect(): void {
    const config = {
      childList: true,
      subtree: true,
    };

    const debouncedScrollIntoView = debounce(
      this.scrollIntoView.bind(this),
      DEBOUNCE_THRESHOLD
    );
    const observer = new MutationObserver(debouncedScrollIntoView);
    observer.observe(this.el, config);

    this.observer = observer;
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private scrollIntoView(): void {
    this.el.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }
}
