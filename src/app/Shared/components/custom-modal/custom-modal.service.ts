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
  private navigationCloseEvent$ = new Subject<void>(); // New subject for navigation events

  constructor() {
    this.setupNavigationHandlers();
  }

  /**
   * Set up handlers for page navigation and refresh events
   */
  private setupNavigationHandlers(): void {
    // Handle beforeunload event (page refresh/close)
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Handle popstate event (browser navigation)
    window.addEventListener('popstate', this.handlePopState);
    
    // Handle pagehide event (page navigation away)
    window.addEventListener('pagehide', this.handlePageHide);
  }

  /**
   * Handle before page unload (refresh/close)
   */
  private handleBeforeUnload = (event: BeforeUnloadEvent) => {
    this.handleNavigationOrRefresh();
  };

  /**
   * Handle browser back/forward navigation
   */
  private handlePopState = (event: PopStateEvent) => {
    this.handleNavigationOrRefresh();
  };

  /**
   * Handle page hide event (navigation away)
   */
  private handlePageHide = (event: PageTransitionEvent) => {
    this.handleNavigationOrRefresh();
  };

  /**
   * Handle navigation or refresh - close modals that are configured to close
   */
  private handleNavigationOrRefresh(): void {
    // Emit navigation event first
    this.navigationCloseEvent$.next();
    
    // Close modals that are configured to close on navigation/refresh
    const modalsToClose = this.activeModals.filter(modalRef => {
      // Find the modal configuration
      const modalConfig = this.getModalConfig(modalRef);
      return modalConfig?.closeOnNavigationOrRefresh === true;
    });

    modalsToClose.forEach(modalRef => {
      modalRef.close();
    });
  }

  /**
   * Get modal configuration for a given modal reference
   * This is a helper method - you might need to adjust based on how you store configs
   */
  private getModalConfig(modalRef: ModalRef): ModalConfig | undefined {
    // This method assumes you have a way to get the config for a modal
    // You might need to store the config when creating the modal or pass it differently
    return (modalRef as any).config;
  }

  /**
   * Opens a modal with the given config. If a parent is provided, links parent-child.
   */
  open(config: ModalConfig, parentRef?: ModalRef): ModalRef {
    const modalRef = new ModalRef();
    
    // Store config reference in modalRef for dynamic updates
    modalRef.config = config;
    
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
      
      // Remove from minimized tracking if it was minimized
      const minIndex = this.minimizedModals.indexOf(modalRef);
      if (minIndex > -1) {
        this.minimizedModals.splice(minIndex, 1);
        this.minimizedUpdate$.next();
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
      
      // Trigger body state update in container
      this.modalFocus$.next(modalRef); // Reuse existing observable
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
      
      // Trigger body state update in container
      this.modalFocus$.next(modalRef); // Reuse existing observable
    }
  }

  // Add a new method to handle modal closure from minimized state
  notifyModalClosed(modalRef: ModalRef): void {
    // Remove from active modals tracking
    const index = this.activeModals.indexOf(modalRef);
    if (index > -1) {
      this.activeModals.splice(index, 1);
    }

    // Remove from minimized tracking if it was minimized
    const minIndex = this.minimizedModals.indexOf(modalRef);
    if (minIndex > -1) {
      this.minimizedModals.splice(minIndex, 1);
      this.minimizedUpdate$.next(); // This will trigger repositioning
    }
  }

  /**
   * Get observable for minimized modal updates
   */
  get minimizedUpdates$() {
    return this.minimizedUpdate$.asObservable();
  }

  /**
   * Get observable for navigation close events
   */
  get navigationCloseEvents$() {
    return this.navigationCloseEvent$.asObservable();
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

  /**
   * Cleanup method to remove event listeners
   */
  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('pagehide', this.handlePageHide);
  }
}