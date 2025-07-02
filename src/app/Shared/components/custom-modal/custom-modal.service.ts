import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig } from './modal-config';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class CustomModalService {
  private modals$ = new Subject<{ config: ModalConfig, modalRef: ModalRef }>();
  private modalFocus$ = new Subject<ModalRef>();
  private activeModals: ModalRef[] = [];

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
  }

  /**
   * Close all modals except the specified one
   */
  closeAllExcept(excludeRef: ModalRef): void {
    this.activeModals
      .filter(modalRef => modalRef !== excludeRef)
      .forEach(modalRef => modalRef.close());
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

  get modalEvents$() {
    return this.modals$.asObservable();
  }

  get modalFocusEvents$() {
    return this.modalFocus$.asObservable();
  }
}