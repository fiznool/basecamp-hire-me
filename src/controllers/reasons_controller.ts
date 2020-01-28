import { Controller } from 'stimulus';
import debounce from 'lodash/debounce';
import shuffle from 'lodash/shuffle';

const TOTAL_REASONS = 5;

const reasonIdsOrdered = Array(TOTAL_REASONS)
  .fill(null)
  .map((_, idx) => {
    const id = `${idx + 1}`;
    return id.padStart(2, '0');
  });

const reasonIdCache = shuffle(reasonIdsOrdered);

let finished = false;

abstract class BaseController extends Controller {
  public readonly listTarget!: HTMLDivElement;
  public readonly ctaTarget!: HTMLButtonElement;
  public observer: MutationObserver;
}

export default class extends ((Controller as unknown) as typeof BaseController) {
  public static targets = ['list', 'cta'];

  public connect(): void {
    const config = {
      childList: true,
      subtree: true,
    };

    const debouncedOnMutation = debounce(this.onMutation.bind(this), 50);
    const observer = new MutationObserver(debouncedOnMutation);
    observer.observe(this.element, config);

    this.observer = observer;
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  public next(): void {
    // Fetch a random fragment.
    const nextFragmentId = reasonIdCache.pop();
    if (typeof nextFragmentId === 'undefined') {
      this.finish();
      return;
    }

    this.disableButton();

    const remainingReasons = reasonIdCache.length;
    const thisReasonNumber = remainingReasons + 1;

    this.fetchFragment(`reasons/${nextFragmentId}`).then(fragment => {
      this.appendReasonContent(thisReasonNumber, fragment);
      this.enableButton(remainingReasons > 0);
    });
  }

  private finish(): void {
    if (finished) {
      return;
    }

    finished = true;
    this.removeButton();
    this.fetchFragment('finish').then(fragment => this.appendContent(fragment));
  }

  private fetchFragment(route: string): Promise<string> {
    const fragmentPath = `fragments/${route}.html`;
    return fetch(fragmentPath).then(res => res.text());
  }

  private appendReasonContent(reasonNumber: number, htmlContent: string): void {
    // Inject the reason number into the returned HTML
    const reasonContent = htmlContent
      .trim()
      .replace('<h2>', `<h2>${reasonNumber}. `);

    this.appendContent(reasonContent);
  }

  private appendContent(html: string): void {
    const template = document.createElement('template');
    template.innerHTML = html;

    this.listTarget.appendChild(template.content);
  }

  private enableButton(remainingReasons: boolean): void {
    this.ctaTarget.innerText = remainingReasons ? 'Next' : 'Finish';
    this.ctaTarget.disabled = false;
  }

  private disableButton(): void {
    this.ctaTarget.disabled = true;
    this.ctaTarget.innerText = 'Loading...';
  }

  private removeButton(): void {
    this.ctaTarget.remove();
  }

  private onMutation(): void {
    console.log('onMutation');
    this.element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }
}
