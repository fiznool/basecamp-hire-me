import BaseController from '../base_controller';
import InterpreterController from './interpreter_controller';
import ModalController from './modal_controller';
import * as templates from '../templates';
import { fetchFragment } from '../utils';
import { createReasonIdCache } from '../factories/reasons';

const TOTAL_REASONS = 10;

// Create a shuffled cache of reasons to fetch and render in the site.
const reasonIdCache = createReasonIdCache(TOTAL_REASONS);

// Track when the 'finish' output has been rendered.
let finished = false;

abstract class BaseRootController extends BaseController {
  public readonly interpreterTarget!: HTMLDivElement;
  public readonly modalTarget!: HTMLDivElement;
}

export default class RootController extends ((BaseController as unknown) as typeof BaseRootController) {
  public static targets = ['interpreter', 'modal'];

  public modalVisibilityToggled(e: CustomEvent): void {
    // Disable the prompt when the modal is shown.
    // This allows the modal to receive keyboard focus, important for snake!
    this.interpreterController.promptEnabled = !e.detail.visible;
  }

  public processInterpreterCommand(e: CustomEvent): void {
    switch (e.detail.command) {
      case 'nextReason':
        this.nextReason();
        break;
      case 'reload':
        this.reload();
        break;
      case 'launchSnake':
        this.launchSnake();
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
    this.interpreterController.promptEnabled = false;

    const remainingReasons = reasonIdCache.remaining();
    const reasonNumber = remainingReasons + 1;
    const hasRemainingReasons = remainingReasons > 0;

    fetchFragment(`reasons/${nextFragmentId}`)
      .then(fragmentHtml => {
        // Format and render the returned fragment.
        const reasonContentHtml = templates.reasonContent({
          reasonNumber,
          fragmentHtml,
        });
        this.interpreterController.renderOutput(reasonContentHtml);

        // Render the correct prompt help.
        this.interpreterController.promptHelp = hasRemainingReasons
          ? templates.promptHelp.ANOTHER_REASON
          : templates.promptHelp.FINISH;
      })
      .catch(e => this.fragmentFetchError(e))
      .finally(() => {
        // Always enable the prompt after the request is done.
        this.interpreterController.promptEnabled = true;
      });
  }

  private launchSnake(): void {
    fetchFragment('snake')
      .then(fragment => this.attachSnake(fragment))
      .catch(e => this.fragmentFetchError(e));
  }

  private reload(): void {
    window.location.reload();
  }

  private finish(): void {
    if (finished) {
      // Nothing to do.
      return;
    }

    // Ensure we only run this once by setting a global flag.
    finished = true;

    // Fetch the 'finish' fragment and render it out.
    fetchFragment('finish')
      .then(fragment => {
        const ic = this.interpreterController;

        // Render the finish fragment and associated prompt help.
        const finishContentHtml = templates.sectionContent({ html: fragment });
        ic.renderOutput(finishContentHtml);
        ic.promptHelp = templates.promptHelp.RESTART;
      })
      .catch(e => this.fragmentFetchError(e));
  }

  private attachSnake(html: string): void {
    const mc = this.modalController;
    mc.content = html;
    mc.visible = true;
  }

  private fragmentFetchError(e: Error): void {
    console.warn(e);
    this.interpreterController.renderOutput(templates.fragmentError);
  }

  private get interpreterController(): InterpreterController {
    return this.findController<InterpreterController>(
      this.interpreterTarget,
      'interpreter'
    );
  }

  private get modalController(): ModalController {
    return this.findController<ModalController>(this.modalTarget, 'modal');
  }
}
