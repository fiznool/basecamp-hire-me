import debounce from 'lodash/debounce';

import BaseController from '../base_controller';

const DEBOUNCE_THRESHOLD = 50;

export default class extends BaseController {
  public observer?: MutationObserver;

  public connect(): void {
    // Use a MutationObserver to always scroll the element to the bottom when anything changes inside it.
    const config = {
      childList: true,
      subtree: true,
    };

    const debouncedScrollToBottom = debounce(
      this.scrollToBottom.bind(this),
      DEBOUNCE_THRESHOLD
    );
    const observer = new MutationObserver(debouncedScrollToBottom);
    observer.observe(this.el, config);

    this.observer = observer;
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private scrollToBottom(): void {
    this.el.scrollIntoView({
      behavior: 'auto',
      block: 'end',
      inline: 'nearest',
    });
  }
}
