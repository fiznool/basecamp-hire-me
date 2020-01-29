import BaseController from '../base_controller';

export default class PromptController extends BaseController<HTMLInputElement> {
  public handleBlur(): void {
    // Make sure an active prompt is always focussed.
    setTimeout(() => {
      if (!this.el.disabled) {
        this.el.focus();
      }
    }, 50);
  }

  public handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const command = this.readPrompt();
      this.dispatchCommand(command);
    }
  }

  public set enabled(enabled: boolean) {
    this.el.disabled = !enabled;
    if (enabled) {
      this.el.focus();
    } else {
      this.el.blur();
    }
  }

  private readPrompt(): string {
    // Read the value, normalising it by lowercasing and removing whitespace
    const command = this.el.value.trim().toLowerCase();

    // Clear the prompt ready for the next command
    this.el.value = '';

    return command;
  }

  private dispatchCommand(command: string): void {
    this.emit('prompt:command', { command });
  }
}
