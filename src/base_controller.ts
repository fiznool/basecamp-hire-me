import { Controller } from 'stimulus';

interface DetailObject {
  [key: string]: string | number | boolean;
}

export default class BaseController<
  T extends Element = Element
> extends Controller {
  protected get el(): T {
    return this.element as T;
  }

  protected emit(name: string, detail: DetailObject = {}): void {
    const evt = new CustomEvent(name, {
      bubbles: true,
      detail,
    });
    this.el.dispatchEvent(evt);
  }

  protected findController<T extends BaseController>(
    element: Element,
    identifier: string
  ): T {
    const controller = this.application.getControllerForElementAndIdentifier(
      element,
      identifier
    );

    if (!controller) {
      throw new Error(
        `Could not find controller with identifier ${identifier} on target, is there definitely a data-controller="${identifier} present on the target?`
      );
    }
    return controller as T;
  }
}
