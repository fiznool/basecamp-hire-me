import { Controller } from 'stimulus';

export default class extends Controller {
  private get promptElement(): HTMLInputElement {
    // Cast the root element as an input, so TypeScript can help us with autocomplete.
    return this.element as HTMLInputElement;
  }

  public handleBlur(): void {
    // Make sure the prompt is always focussed.
    setTimeout(() => this.promptElement.focus(), 50);
  }

  public handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const command = this.readPrompt();
      this.dispatchCommand(command);
    }
  }

  private readPrompt(): string {
    // Read the value, normalising it by lowercasing and removing whitespace
    const command = this.promptElement.value.trim().toLowerCase();

    // Clear the prompt ready for the next command
    this.promptElement.value = '';

    return command;
  }

  private dispatchCommand(command: string): void {
    const evt = new CustomEvent('prompt:command', {
      bubbles: true,
      detail: { command },
    });
    this.element.dispatchEvent(evt);
  }
}
