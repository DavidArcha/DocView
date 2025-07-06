import { ChangeDetectorRef, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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
  private baseZIndex = 1000;

  constructor(private modalService: CustomModalService,private cdr: ChangeDetectorRef,) { }

  ngOnInit() {
    this.modalService.modalEvents$.subscribe(({ config, modalRef }) => {
      this.openModal(config, modalRef);
    });

    // Subscribe to modal focus events from the service
    this.modalService.modalFocusEvents$.subscribe((modalRef: ModalRef) => {
      this.bringModalToFront(modalRef);
    });

    // Subscribe to minimized modal updates
    this.modalService.minimizedUpdates$.subscribe(() => {
      this.repositionMinimizedModals();
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
    
    // Set initial z-index
    const zIndex = this.baseZIndex + this.modalStack.length;
    cmpRef.instance.zIndex = zIndex;
    
    this.activeModals.set(modalRef, cmpRef);

    // Set up close handler
    modalRef.afterClosed().subscribe(() => {
      this.closeModal(modalRef, config);
    });

    // Update z-index for all modals
    this.updateModalZIndexes();
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

    // Check if the modal being closed was minimized
    const closingComponent = this.activeModals.get(modalRef);
    const wasMinimized = closingComponent?.instance.isMinimized || false;

    // Notify service about modal closure (will handle minimized tracking)
    this.modalService.notifyModalRestored(modalRef);

    // Destroy component
    if (config.destroyOnClose !== false) {
      const toDestroy = this.activeModals.get(modalRef);
      if (toDestroy) toDestroy.destroy();
    }
    this.activeModals.delete(modalRef);

    // Update body state based on remaining modals
    this.updateBodyState();
    
    // Update z-indexes after modal is closed
    this.updateModalZIndexes();

    // If the closed modal was minimized, reposition all remaining minimized modals
    if (wasMinimized) {
      setTimeout(() => {
        this.repositionMinimizedModals();
      }, 0);
    }
  }

  /**
   * Reposition all minimized modals to fill gaps when one is restored or closed
   */
  private repositionMinimizedModals() {
    let minimizedIndex = 0;
    const minimizedWidth = 300;
    const minimizedHeight = 40;
    const spacing = 10;
    const bottomMargin = 20;
    const leftMargin = 20;

    // Get all minimized modals and sort them by their current left position
    // to maintain relative order when repositioning
    const minimizedModals: { modalRef: ModalRef, cmpRef: ComponentRef<CustomModalPopupComponent> }[] = [];
    
    this.activeModals.forEach((cmpRef, modalRef) => {
      if (cmpRef.instance.isMinimized) {
        minimizedModals.push({ modalRef, cmpRef });
      }
    });

    // Sort by current left position to maintain visual order
    minimizedModals.sort((a, b) => a.cmpRef.instance.left - b.cmpRef.instance.left);

    // Reposition each minimized modal in order
    minimizedModals.forEach(({ cmpRef }) => {
      // Calculate new position
      let left = leftMargin + (minimizedWidth + spacing) * minimizedIndex;
      let top = window.innerHeight - minimizedHeight - bottomMargin;

      // Check if we need to wrap to next row
      const maxLeft = window.innerWidth - minimizedWidth - leftMargin;
      if (left > maxLeft) {
        const itemsPerRow = Math.floor((window.innerWidth - leftMargin * 2) / (minimizedWidth + spacing));
        const row = Math.floor(minimizedIndex / itemsPerRow);
        const col = minimizedIndex % itemsPerRow;
        
        left = leftMargin + (minimizedWidth + spacing) * col;
        top = window.innerHeight - minimizedHeight - bottomMargin - (minimizedHeight + spacing) * row;
      }

      // Update position with smooth transition
      cmpRef.instance.left = left;
      cmpRef.instance.top = top;

      // Update the component's minimized index
      (cmpRef.instance as any).minimizedIndex = minimizedIndex;
      cmpRef.instance.cdr.detectChanges();
      minimizedIndex++;
    });
  }

  /**
   * Bring a specific modal to the front
   */
  private bringModalToFront(modalRef: ModalRef) {
    const modalIndex = this.modalStack.indexOf(modalRef);
    if (modalIndex === -1) return; // Modal not found

    // Remove modal from current position and add to end (top)
    this.modalStack.splice(modalIndex, 1);
    this.modalStack.push(modalRef);

    // Update z-indexes for all modals
    this.updateModalZIndexes();
  }

  /**
   * Update z-indexes for all active modals based on their stack order
   */
  private updateModalZIndexes() {
    this.modalStack.forEach((modalRef, index) => {
      const cmpRef = this.activeModals.get(modalRef);
      if (cmpRef) {
        const newZIndex = this.baseZIndex + index + 1;
        cmpRef.instance.zIndex = newZIndex;
        cmpRef.instance.updateZIndex(newZIndex);
      }
    });
  }

  private updateBodyState() {
    // Only consider non-minimized modals for background blocking
    const hasBlockingModal = this.modalStack.some(modalRef => {
      const cmpRef = this.activeModals.get(modalRef);
      return cmpRef && 
             !cmpRef.instance.config.allowBackgroundInteraction && 
             !cmpRef.instance.isMinimized; // Don't block if minimized
    });

    // Check if there are any non-minimized modals
    const hasActiveNonMinimizedModals = this.modalStack.some(modalRef => {
      const cmpRef = this.activeModals.get(modalRef);
      return cmpRef && !cmpRef.instance.isMinimized;
    });

    if (hasBlockingModal) {
      // At least one non-minimized modal blocks background interaction
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else if (!hasActiveNonMinimizedModals) {
      // No non-minimized modals open (all are minimized or closed)
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    } else {
      // Only interactive non-minimized modals open
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