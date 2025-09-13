import { ChangeDetectorRef, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { CustomModalService } from '../custom-modal.service';
import { CustomModalPopupComponent } from '../custom-modal-popup/custom-modal-popup.component';
import { ModalRef } from '../modal-ref';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-modal-container',
  standalone: false,
  templateUrl: './custom-modal-container.component.html',
  styleUrl: './custom-modal-container.component.scss'
})
export class CustomModalContainerComponent implements OnInit, OnDestroy {
  @ViewChild('modalOutlet', { read: ViewContainerRef, static: true })
  modalOutlet!: ViewContainerRef;

  private activeModals = new Map<ModalRef, ComponentRef<CustomModalPopupComponent>>();
  private modalStack: ModalRef[] = [];
  private baseZIndex = 1000;
  private subscriptions: Subscription[] = [];

  constructor(
    private modalService: CustomModalService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // Subscribe to modal creation events
    this.subscriptions.push(
      this.modalService.modalEvents$.subscribe(({ config, modalRef }) => {
        this.openModal(config, modalRef);
      })
    );

    // Subscribe to modal focus events from the service
    this.subscriptions.push(
      this.modalService.modalFocusEvents$.subscribe((modalRef: ModalRef) => {
        this.bringModalToFront(modalRef);
      })
    );

    // Subscribe to minimized modal updates
    this.subscriptions.push(
      this.modalService.minimizedUpdates$.subscribe(() => {
        this.repositionMinimizedModals();
      })
    );

    // Subscribe to navigation close events
    this.subscriptions.push(
      this.modalService.navigationCloseEvents$.subscribe(() => {
        this.handleNavigationClose();
      })
    );
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Handle navigation close events
   */
  private handleNavigationClose(): void {
    // This method can be used to perform additional cleanup
    // when modals are closed due to navigation/refresh
    console.log('Navigation event detected - closing configured modals');
    
    // Optional: Update body state after navigation closes
    setTimeout(() => {
      this.updateBodyState();
    }, 0);
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

    // Get component reference for the clicked modal
    const clickedModalCmp = this.activeModals.get(modalRef);
    if (!clickedModalCmp) return;

    // Get the DOM element and rect for the clicked modal
    const clickedModalElement = clickedModalCmp.location.nativeElement.querySelector('.custom-modal');
    if (!clickedModalElement) return;
    
    const clickedRect = clickedModalElement.getBoundingClientRect();

    // Find modals that are visually overlapping with this one
    const overlappingModals: { ref: ModalRef, cmp: ComponentRef<CustomModalPopupComponent>, element: HTMLElement }[] = [];

    this.modalStack.forEach((ref, idx) => {
      // Skip the clicked modal itself
      if (ref === modalRef) return;
      
      // Skip minimized modals
      const cmp = this.activeModals.get(ref);
      if (!cmp || cmp.instance.isMinimized) return;

      const modalElement = cmp.location.nativeElement.querySelector('.custom-modal');
      if (!modalElement) return;
      
      const rect = modalElement.getBoundingClientRect();
      
      // Check if this modal visually overlaps with the clicked one
      const overlaps = !(
        rect.right < clickedRect.left || 
        rect.left > clickedRect.right || 
        rect.bottom < clickedRect.top || 
        rect.top > clickedRect.bottom
      );
      
      // Only move modals that are actually overlapping
      if (overlaps) {
        overlappingModals.push({ ref, cmp, element: modalElement });
      }
    });
    
    console.log(`Found ${overlappingModals.length} overlapping modals`);

    // Determine direction with most space - prefer right, then left, then up
    const rightSpace = window.innerWidth - clickedRect.right;
    const leftSpace = clickedRect.left;
    const topSpace = clickedRect.top;
    
    let moveDirection = 'right';
    if (rightSpace < leftSpace && leftSpace > 150) moveDirection = 'left';
    else if (rightSpace < 150 && topSpace > 150) moveDirection = 'up';
    
    if (overlappingModals.length > 0) {
      overlappingModals.forEach((modal, idx) => {
        // Calculate an appropriate offset based on direction
        let offsetX = 0;
        let offsetY = 0;
        
        switch(moveDirection) {
          case 'right':
            offsetX = clickedRect.width * 0.7; // 70% of modal width
            offsetY = 20 * (idx + 1); // Slight step down for visibility
            break;
          case 'left':
            offsetX = -clickedRect.width * 0.7; // 70% of modal width to the left
            offsetY = 20 * (idx + 1);
            break;
          case 'up':
            offsetY = -clickedRect.height * 0.7; // 70% of modal height up
            offsetX = 20 * (idx + 1); // Slight step to the right
            break;
        }
        
        // Calculate new position
        const newLeft = modal.cmp.instance.left + offsetX;
        const newTop = modal.cmp.instance.top + offsetY;
        
        // Apply max boundaries to ensure modal remains visible
        const maxLeft = window.innerWidth - 100;
        const maxTop = window.innerHeight - 100;
        const minLeft = -modal.element.offsetWidth + 100; // Keep at least 100px visible
        const minTop = 0; // Don't go above top of screen
        
        modal.cmp.instance.left = Math.max(minLeft, Math.min(maxLeft, newLeft));
        modal.cmp.instance.top = Math.max(minTop, Math.min(maxTop, newTop));
        
        // Add animation class for smooth transition
        modal.element.classList.add('repositioning');
        
        // Remove animation class after transition completes
        setTimeout(() => {
          modal.element.classList.remove('repositioning');
        }, 500);
        
        // Mark as not top modal
        modal.element.classList.remove('modal-top');
        
        // Trigger change detection
        modal.cmp.instance.cdr.detectChanges();
      });
      
      // Mark clicked modal as top modal for visual differentiation
      clickedModalElement.classList.add('modal-top');
    }

    // Remove modal from current position and add to end (top) in the stack
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