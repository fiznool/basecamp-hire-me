import { Controller } from 'stimulus';
import debounce from 'lodash/debounce';

const DEBOUNCE_THRESHOLD = 50;

export default class extends Controller {
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
    observer.observe(this.element, config);

    this.observer = observer;
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private scrollIntoView(): void {
    this.element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }
}
