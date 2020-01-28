import { Controller } from 'stimulus';
import debounce from 'lodash/debounce';
import shuffle from 'lodash/shuffle';

const TOTAL_REASONS = 10;

const reasonIdCache = createReasonIdCache(TOTAL_REASONS);

let finished = false;

function createReasonIdCache(total: number): string[] {
  const cache = Array(total)
    .fill(null)
    .map((_, i) => {
      const id = `${i + 1}`;
      const idPadded = id.padStart(2, '0');
      return idPadded;
    });

  return shuffle(cache);
}

abstract class BaseController extends Controller {
  public readonly contentTarget!: HTMLDivElement;
  public readonly listTarget!: HTMLDivElement;
  public readonly promptTarget!: HTMLInputElement;
  public readonly promptHelpTarget!: HTMLInputElement;
  public observer?: MutationObserver;
}

export default class extends ((Controller as unknown) as typeof BaseController) {
  public static targets = ['content', 'list', 'prompt', 'promptHelp'];

  public connect(): void {
    const config = {
      childList: true,
      subtree: true,
    };

    const debouncedOnMutation = debounce(this.onMutation.bind(this), 50);
    const observer = new MutationObserver(debouncedOnMutation);
    observer.observe(this.contentTarget, config);

    this.observer = observer;
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  public focusPrompt(): void {
    setTimeout(() => this.promptTarget.focus(), 50);
  }

  public handlePromptKeypress(e: MouseEvent): void {
    if (e.which === 13) {
      const command = this.readPrompt();
      switch (command) {
        case 'b':
        case 'begin':
        case 'm':
        case 'more':
          this.nextReason();
          break;
        case 'r':
        case 'restart':
          this.reload();
          break;
        default:
          this.commandNotFound();
          break;
      }
    }
  }

  private finish(): void {
    if (finished) {
      return;
    }
    finished = true;

    this.fetchFragment('finish').then(fragment => {
      const node = this.htmlToNode(fragment);
      this.contentTarget.appendChild(node);
    });
  }

  private nextReason(): void {
    // Fetch a random fragment.
    const nextFragmentId = reasonIdCache.pop();
    if (typeof nextFragmentId === 'undefined') {
      this.finish();
      return;
    }

    this.disablePrompt();

    const remainingReasons = reasonIdCache.length;
    const thisReasonNumber = remainingReasons + 1;

    this.fetchFragment(`reasons/${nextFragmentId}`).then(fragment => {
      this.appendReasonContent(thisReasonNumber, fragment);
      this.enablePrompt();

      const promptHelp = remainingReasons
        ? `Type <kbd>more</kbd> (<kbd>m</kbd>) for another reason, or <kbd>restart</kbd> (<kbd>r</kbd>) to start again`
        : `Type <kbd>restart</kbd> (<kbd>r</kbd>) to start again`;
      this.setPromptHelp(promptHelp);
    });
  }

  private reload(): void {
    window.location.reload();
  }

  private commandNotFound() {
    // TODO show the user
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

    const node = this.htmlToNode(`<hr>${reasonContent}`);
    this.listTarget.appendChild(node);
  }

  private htmlToNode(html: string): Node {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
  }

  private readPrompt(): string {
    const command = this.promptTarget.value.trim().toLowerCase();
    this.clearPrompt();
    return command;
  }

  private clearPrompt(): void {
    this.promptTarget.value = '';
  }

  private enablePrompt(): void {
    this.promptTarget.disabled = false;
  }

  private disablePrompt(): void {
    this.promptTarget.disabled = true;
  }

  private setPromptHelp(content: string): void {
    this.promptHelpTarget.innerHTML = content;
  }

  private clearPromptHelp(): void {
    this.promptHelpTarget.innerHTML = '';
  }

  private onMutation(): void {
    this.element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }
}
