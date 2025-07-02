import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CustomModalService } from '../custom-modal.service';
import { CustomModalPopupComponent } from '../custom-modal-popup/custom-modal-popup.component';
import { ModalRef } from '../modal-ref';

@Component({
  selector: 'app-custom-modal-container',
  standalone: false,
  templateUrl: './custom-modal-container.component.html',
  styleUrl: './custom-modal-container.component.scss'
})
export class CustomModalContainerComponent implements OnInit {
  @ViewChild('modalOutlet', { read: ViewContainerRef, static: true })
  modalOutlet!: ViewContainerRef;

  private activeModals = new Map<ModalRef, ComponentRef<CustomModalPopupComponent>>();
  private modalStack: ModalRef[] = [];

  constructor(private modalService: CustomModalService) { }

  ngOnInit() {
    this.modalService.modalEvents$.subscribe(({ config, modalRef }) => {
      this.openModal(config, modalRef);
    });
  }

  private openModal(config: any, modalRef: ModalRef) {
    // Add to modal stack
    this.modalStack.push(modalRef);
    
    // Handle background interaction and body scroll
    this.updateBodyState();
    
    // Create modal component
    const cmpRef = this.modalOutlet.createComponent(CustomModalPopupComponent);
    cmpRef.instance.config = config;
    cmpRef.instance.modalRef = modalRef;
    this.activeModals.set(modalRef, cmpRef);

    // Set up close handler
    modalRef.afterClosed().subscribe(() => {
      this.closeModal(modalRef, config);
    });
  }

  private closeModal(modalRef: ModalRef, config: any) {
    // Remove from modal stack
    const index = this.modalStack.indexOf(modalRef);
    if (index > -1) {
      this.modalStack.splice(index, 1);
    }

    // Cascade to children if needed
    if (config.closeChildrenOnParentClose) {
      modalRef.children.forEach(child => child.close());
    }

    // Destroy component
    if (config.destroyOnClose !== false) {
      const toDestroy = this.activeModals.get(modalRef);
      if (toDestroy) toDestroy.destroy();
    }
    this.activeModals.delete(modalRef);

    // Update body state based on remaining modals
    this.updateBodyState();
  }

  private updateBodyState() {
    const hasBlockingModal = this.modalStack.some(modalRef => {
      const cmpRef = this.activeModals.get(modalRef);
      return cmpRef && !cmpRef.instance.config.allowBackgroundInteraction;
    });

    if (hasBlockingModal) {
      // At least one modal blocks background interaction
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else if (this.modalStack.length === 0) {
      // No modals open
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    } else {
      // Only interactive modals open
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Get the current number of active modals
   */
  get activeModalCount(): number {
    return this.modalStack.length;
  }

  /**
   * Check if background interaction is currently blocked
   */
  get isBackgroundBlocked(): boolean {
    return this.modalStack.some(modalRef => {
      const cmpRef = this.activeModals.get(modalRef);
      return cmpRef && !cmpRef.instance.config.allowBackgroundInteraction;
    });
  }
}