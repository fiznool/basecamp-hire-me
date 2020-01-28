import { Controller } from 'stimulus';

export default class extends Controller {
  public connect(): void {
    this.element.textContent = 'It works!';
  }
}
