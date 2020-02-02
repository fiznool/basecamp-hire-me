import BaseController from '../base_controller';
import * as templates from '../templates';
import { appendHtml } from '../utils';

import PromptController from './prompt_controller';

abstract class BaseInterpreterController extends BaseController {
  public readonly outputTarget!: HTMLDivElement;
  public readonly promptTarget!: HTMLInputElement;
  public readonly promptHelpTarget!: HTMLInputElement;
}

export default class InterpreterController extends ((BaseController as unknown) as typeof BaseInterpreterController) {
  public static targets = ['output', 'prompt', 'promptHelp'];

  public processCommand(e: CustomEvent): void {
    const { command } = e.detail;

    this.printCommand(command);

    switch (command) {
      case 'b':
      case 'begin':
      case '':
        this.emit('interpreter:command', { command: 'nextReason' });
        break;
      case 'r':
      case 'restart':
        this.emit('interpreter:command', { command: 'reload' });
        break;
      case 's':
      case 'snake':
        this.emit('interpreter:command', { command: 'launchSnake' });
        break;
      default:
        this.commandNotFound(command);
        break;
    }
  }

  public set promptEnabled(enabled: boolean) {
    // Use the prompt controller instead of manipulating the target directly.
    this.promptController.enabled = enabled;
  }

  public renderOutput(html: string): void {
    appendHtml(this.outputTarget, html);
  }

  private printCommand(command: string): void {
    const html = templates.inputPrompt({ command });
    appendHtml(this.outputTarget, html);
  }

  private commandNotFound(command: string): void {
    appendHtml(this.outputTarget, templates.commandNotFound({ command }));
  }

  private get promptController(): PromptController {
    // Instead of directly manipulating the promptTarget, since it has an associated controller, proxy calls to it.
    // This allows the prompt controller to encapsulate the functionality and expose a simple API for modifications.
    return this.findController<PromptController>(this.promptTarget, 'prompt');
  }

  public set promptHelp(html: string) {
    this.promptHelpTarget.innerHTML = html;
  }
}
