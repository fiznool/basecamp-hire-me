import BaseController from '../base_controller';

const MODAL_VISIBLE_CLASS = 'modal-outlet--visible';

export default class ModalController extends BaseController {
  public set visible(visible: boolean) {
    this.element.classList.toggle(MODAL_VISIBLE_CLASS, visible);
    this.emit('modal:visibilityToggle', { visible });
  }

  public set content(contentHtml: string) {
    this.element.innerHTML = contentHtml;
  }

  public handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.content = '';
      this.visible = false;
    }
  }
}
