import { Controller } from 'stimulus';

import { promptHelp, reasonContent } from '../helpers';
import { createReasonIdCache } from '../reasons';
import { fetchFragment, appendHtml } from '../utils';

const TOTAL_REASONS = 10;

const reasonIdCache = createReasonIdCache(TOTAL_REASONS);

let finished = false;

abstract class BaseController extends Controller {
  public readonly outputTarget!: HTMLDivElement;
  public readonly promptTarget!: HTMLInputElement;
  public readonly promptHelpTarget!: HTMLInputElement;
}

export default class extends ((Controller as unknown) as typeof BaseController) {
  public static targets = ['output', 'prompt', 'promptHelp'];

  public processCommand(e: CustomEvent): void {
    const { command } = e.detail;
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

  private nextReason(): void {
    // Get the next fragment ID from the cache.
    const nextFragmentId = reasonIdCache.next();
    if (typeof nextFragmentId === 'undefined') {
      // We've no more reasons left - finish up.
      this.finish();
      return;
    }

    // Make sure the prompt can't be used whilst the next reason is fetched.
    this.promptEnabled = false;

    const remainingReasons = reasonIdCache.remaining();
    const reasonNumber = remainingReasons + 1;
    const hasRemainingReasons = !reasonIdCache.isEmpty();

    fetchFragment(`reasons/${nextFragmentId}`)
      .then(fragment => {
        // Format and render the returned fragment.
        const reasonContentHtml = reasonContent(reasonNumber, fragment);
        appendHtml(this.outputTarget, reasonContentHtml);

        // Render the prompt help.
        const promptHelpHtml = promptHelp(hasRemainingReasons);
        this.promptHelp = promptHelpHtml;
      })
      .finally(() => {
        // Always enable the prompt after the request is done.
        this.promptEnabled = true;
      });
  }

  private finish(): void {
    if (finished) {
      // Nothing to do.
      return;
    }

    // Ensure we only run this once by setting a global flag.
    finished = true;

    // Fetch the 'finish' fragment and render it out.
    fetchFragment('finish').then(fragment =>
      appendHtml(this.outputTarget, fragment)
    );
  }

  private reload(): void {
    window.location.reload();
  }

  private commandNotFound() {
    // TODO show the user
  }

  private set promptEnabled(enabled: boolean) {
    this.promptTarget.disabled = !enabled;
  }

  private set promptHelp(content: string) {
    this.promptHelpTarget.innerHTML = content;
  }
}
