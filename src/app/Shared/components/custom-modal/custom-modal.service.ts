import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig } from './modal-config';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class CustomModalService {
  private modals$ = new Subject<{ config: ModalConfig, modalRef: ModalRef }>();
  private modalFocus$ = new Subject<ModalRef>();
  private activeModals: ModalRef[] = [];
  private minimizedModals: ModalRef[] = []; // Track minimized modals
  private minimizedUpdate$ = new Subject<void>(); // Notify when minimized list changes

  /**
   * Opens a modal with the given config. If a parent is provided, links parent-child.
   */
  open(config: ModalConfig, parentRef?: ModalRef): ModalRef {
    const modalRef = new ModalRef();
    
    // Set up parent-child relationship
    if (parentRef) {
      modalRef.parent = parentRef;
      parentRef.children.push(modalRef);
    }

    // Add to active modals tracking
    this.activeModals.push(modalRef);

    // Set up close handler to remove from tracking
    modalRef.afterClosed().subscribe(() => {
      const index = this.activeModals.indexOf(modalRef);
      if (index > -1) {
        this.activeModals.splice(index, 1);
      }
    });

    // Emit modal creation event
    this.modals$.next({ config, modalRef });
    
    return modalRef;
  }

  /**
   * Bring a specific modal to the front
   */
  focusModal(modalRef: ModalRef): void {
    if (this.activeModals.includes(modalRef)) {
      this.modalFocus$.next(modalRef);
    }
  }

  /**
   * Close all open modals
   */
  closeAll(): void {
    [...this.activeModals].forEach(modalRef => modalRef.close());
    this.minimizedModals.length = 0; // Clear minimized tracking
  }

  /**
   * Close all modals except the specified one
   */
  closeAllExcept(excludeRef: ModalRef): void {
    this.activeModals
      .filter(modalRef => modalRef !== excludeRef)
      .forEach(modalRef => {
        modalRef.close();
        // Remove from minimized tracking if it was minimized
        const minIndex = this.minimizedModals.indexOf(modalRef);
        if (minIndex > -1) {
          this.minimizedModals.splice(minIndex, 1);
        }
      });
    this.minimizedUpdate$.next();
  }

  /**
   * Get the count of currently active modals
   */
  get activeModalCount(): number {
    return this.activeModals.length;
  }

  /**
   * Check if there are any blocking modals (non-interactive) open
   */
  get hasBlockingModal(): boolean {
    return this.activeModals.length > 0;
  }

  /**
   * Get the count of currently minimized modals
   */
  getMinimizedModalCount(): number {
    return this.minimizedModals.length;
  }

  /**
   * Notify service that a modal has been minimized
   */
  notifyModalMinimized(modalRef: ModalRef): void {
    if (!this.minimizedModals.includes(modalRef)) {
      this.minimizedModals.push(modalRef);
      this.minimizedUpdate$.next();
    }
  }

  /**
   * Notify service that a modal has been restored
   */
  notifyModalRestored(modalRef: ModalRef): void {
    const index = this.minimizedModals.indexOf(modalRef);
    if (index > -1) {
      this.minimizedModals.splice(index, 1);
      this.minimizedUpdate$.next();
      // Reposition remaining minimized modals
      this.repositionMinimizedModals();
    }
  }

  /**
   * Get observable for minimized modal updates
   */
  get minimizedUpdates$() {
    return this.minimizedUpdate$.asObservable();
  }

  /**
   * Reposition all minimized modals to fill gaps
   */
  private repositionMinimizedModals(): void {
    // This will be handled by the container component
    // when it receives the minimized update event
  }

  get modalEvents$() {
    return this.modals$.asObservable();
  }

  get modalFocusEvents$() {
    return this.modalFocus$.asObservable();
  }
}