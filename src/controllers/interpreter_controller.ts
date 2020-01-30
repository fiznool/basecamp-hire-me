import BaseController from '../base_controller';
import {
  promptHelp,
  reasonContent,
  PromptHelpType,
  sectionContent,
} from '../helpers';
import { createReasonIdCache } from '../factories/reasons';
import { fetchFragment, appendHtml } from '../utils';

import PromptController from './prompt_controller';
import ModalController from './modal_controller';

const TOTAL_REASONS = 10;

const reasonIdCache = createReasonIdCache(TOTAL_REASONS);

let finished = false;

abstract class BaseInterpreterController extends BaseController {
  public readonly outputTarget!: HTMLDivElement;
  public readonly promptTarget!: HTMLInputElement;
  public readonly promptHelpTarget!: HTMLInputElement;
  public readonly modalTarget!: HTMLDivElement;
}

export default class InterpreterController extends ((BaseController as unknown) as typeof BaseInterpreterController) {
  public static targets = ['output', 'prompt', 'promptHelp', 'modal'];

  public processCommand(e: CustomEvent): void {
    const { command } = e.detail;

    this.printCommand(command);

    switch (command) {
      case 'b':
      case 'begin':
      case '':
        this.nextReason();
        break;
      case 'r':
      case 'restart':
        this.reload();
        break;
      case 's':
      case 'snake':
        this.launchSnake();
        break;
      default:
        this.commandNotFound(command);
        break;
    }
  }

  public modalVisibilityToggled(e: CustomEvent): void {
    const { visible } = e.detail;
    this.promptController.enabled = !visible;
  }

  private printCommand(command: string): void {
    appendHtml(this.outputTarget, `<p class="input-prompt">${command}</p>`);
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
    const hasRemainingReasons = remainingReasons > 0;

    fetchFragment(`reasons/${nextFragmentId}`)
      .then(fragment => {
        // Format and render the returned fragment.
        const reasonContentHtml = reasonContent(reasonNumber, fragment);
        appendHtml(this.outputTarget, reasonContentHtml);

        // Render the prompt help.
        this.promptHelp = hasRemainingReasons
          ? PromptHelpType.ANOTHER_REASON
          : PromptHelpType.FINISH;
      })
      .catch(e => this.fragmentFetchError(e))
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
    fetchFragment('finish')
      .then(fragment => {
        const finishContentHtml = sectionContent(fragment);
        appendHtml(this.outputTarget, finishContentHtml);
        this.promptHelp = PromptHelpType.RESTART;
      })
      .catch(e => this.fragmentFetchError(e));
  }

  private launchSnake(): void {
    fetchFragment('snake')
      .then(fragment => this.attachSnake(fragment))
      .catch(e => this.fragmentFetchError(e));
  }

  private attachSnake(html: string): void {
    const mc = this.modalController;
    mc.content = html;
    mc.visible = true;
  }

  private reload(): void {
    window.location.reload();
  }

  private fragmentFetchError(e: Error): void {
    console.warn(e);
    appendHtml(
      this.outputTarget,
      '<p>Sorry, there was a problem, please try again later.</p>'
    );
  }

  private commandNotFound(command: string): void {
    appendHtml(
      this.outputTarget,
      `<p class="tight-top">Command not found: ${command}</p>`
    );
  }

  private get promptController(): PromptController {
    // Instead of directly manipulating the promptTarget, since it has an associated controller, proxy calls to it.
    // This allows the prompt controller to encapsulate the functionality and expose a simple API for modifications.
    return this.findController<PromptController>(this.promptTarget, 'prompt');
  }

  private get modalController(): ModalController {
    return this.findController<ModalController>(this.modalTarget, 'modal');
  }

  private set promptEnabled(enabled: boolean) {
    // Use the prompt controller instead of manipulating the target directly.
    this.promptController.enabled = enabled;
  }

  private set promptHelp(type: PromptHelpType) {
    const content = promptHelp(type);
    this.promptHelpTarget.innerHTML = content;
  }
}
