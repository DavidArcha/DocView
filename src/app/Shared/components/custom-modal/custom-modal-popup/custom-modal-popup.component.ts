import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef, Inject } from '@angular/core';
import { ModalConfig } from '../modal-config';
import { ModalRef } from '../modal-ref';
import { CustomModalService } from '../custom-modal.service';

let lastZIndex = 1000;
@Component({
  selector: 'app-custom-modal-popup',
  standalone: false,
  templateUrl: './custom-modal-popup.component.html',
  styleUrl: './custom-modal-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalPopupComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() config!: ModalConfig;
  @Input() modalRef!: ModalRef;

  @ViewChild('dynamicContent', { read: ViewContainerRef }) dynamicContent!: ViewContainerRef;
  @ViewChild('dynamicFooter', { read: ViewContainerRef }) dynamicFooter!: ViewContainerRef;

  isMinimized = false;
  zIndex = 0;
  top = 0;
  left = 0;
  private dragging = false;
  private dragOffset = { x: 0, y: 0 };
  private savedBounds: { top: number, left: number, width: string, height: string } | null = null;
  private modalElement?: HTMLElement;
  // Add property to track minimized position
  private minimizedIndex = 0;

  constructor(
    public el: ElementRef,
    public cdr: ChangeDetectorRef,
    private modalService: CustomModalService
  ) { }

  ngOnInit() {
    this.zIndex = ++lastZIndex;
    this.initializePosition();
    
    // Set up keyboard handlers for the document
    this.setupGlobalKeyboardHandlers();
  }

  ngAfterViewInit() {
    // Cache modal element reference
    this.modalElement = this.el.nativeElement.querySelector('.custom-modal');

    // Add click handler to bring modal to front
    if (this.modalElement) {
      this.modalElement.addEventListener('mousedown', this.onModalMouseDown);
    }

    // Create main component - Updated to use modern Angular approach
    if (this.config.component && !this.config.template && this.dynamicContent) {
      const compRef = this.dynamicContent.createComponent(this.config.component);
      Object.assign(compRef.instance, this.config.data || {});
      if ('modalRef' in compRef.instance) {
        (compRef.instance as any).modalRef = this.modalRef;
      }
    }

    // Create footer component if specified - Updated to use modern Angular approach
    if (this.config.footerComponent && this.dynamicFooter) {
      const footerRef = this.dynamicFooter.createComponent(this.config.footerComponent);
      Object.assign(footerRef.instance, this.config.footerData || {});
      if ('modalRef' in footerRef.instance) {
        (footerRef.instance as any).modalRef = this.modalRef;
      }
    }

    // Set up focus management
    this.setupFocusTrap();
    
    // Center modal after content loads
    requestAnimationFrame(() => this.centerModal());
  }

  /**
   * Handle mouse down on modal to bring it to front
   */
  private onModalMouseDown = (event: MouseEvent) => {
    // Only handle if background interaction is allowed and there are multiple modals
    if (this.config.allowBackgroundInteraction && this.modalService.activeModalCount > 1) {
      // Don't focus if clicking on backdrop
      if (event.target === this.el.nativeElement.querySelector('.modal-backdrop')) {
        return;
      }
      
      this.bringToFront();
    }
  };

  /**
   * Bring this modal to the front
   */
  private bringToFront() {
    this.modalService.focusModal(this.modalRef);
  }

  /**
   * Update z-index from external source (modal container)
   */
  updateZIndex(newZIndex: number) {
    this.zIndex = newZIndex;
    if (this.modalElement) {
      this.modalElement.style.zIndex = newZIndex.toString();
    }
    this.cdr.detectChanges();
  }

  /**
   * Check if modal should auto-size based on content
   */
  isAutoSize(): boolean {
    return this.config.autoSize === true || (!this.config.width && !this.config.height);
  }

  /**
   * Get dynamic modal styles based on configuration
   */
  getModalStyles(): any {
    const styles: any = {
      position: 'fixed',
      top: this.top + 'px',
      left: this.left + 'px',
      zIndex: this.zIndex,
      borderRadius: '6px'
    };

    // Handle width
    if (this.config.width) {
      styles.width = this.config.width;
    } else if (!this.isAutoSize()) {
      styles.width = 'auto';
    }

    // Handle height
    if (this.config.height) {
      styles.height = this.config.height;
    } else if (!this.isAutoSize()) {
      styles.height = 'auto';
    }

    // Add min/max constraints
    if (this.config.minWidth) styles.minWidth = this.config.minWidth;
    if (this.config.minHeight) styles.minHeight = this.config.minHeight;
    if (this.config.maxWidth) styles.maxWidth = this.config.maxWidth;
    if (this.config.maxHeight) styles.maxHeight = this.config.maxHeight;

    // Auto-size constraints
    if (this.isAutoSize()) {
      styles.maxWidth = this.config.maxWidth || '90vw';
      styles.maxHeight = this.config.maxHeight || '90vh';
      styles.minWidth = this.config.minWidth || '320px';
      styles.minHeight = this.config.minHeight || '200px';
    }

    return styles;
  }

  /**
   * Determines if the footer should be shown
   */
  shouldShowFooter(): boolean {
    return this.config.showFooter === true || 
           !!this.config.footerTemplate || 
           !!this.config.footerComponent;
  }

  initializePosition() {
    // For auto-size modals, use smaller default dimensions for initial positioning
    let defaultWidth = 600;
    let defaultHeight = 400;

    if (this.config.width) {
      defaultWidth = parseInt(this.config.width);
    } else if (this.isAutoSize()) {
      defaultWidth = 400; // Smaller initial size for auto-size
    }

    if (this.config.height) {
      defaultHeight = parseInt(this.config.height);
    } else if (this.isAutoSize()) {
      defaultHeight = 300; // Smaller initial size for auto-size
    }
    
    // Offset multiple modals slightly
    const offset = (this.modalService.activeModalCount - 1) * 30;
    this.top = Math.max((window.innerHeight - defaultHeight) / 2 + offset, 40);
    this.left = Math.max((window.innerWidth - defaultWidth) / 2 + offset, 0);
  }

  centerModal() {
    if (!this.modalElement) return;
    
    // Wait for content to fully render
    setTimeout(() => {
      const rect = this.modalElement!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      
      // Center based on actual rendered size
      this.top = Math.max((window.innerHeight - h) / 2, 40);
      this.left = Math.max((window.innerWidth - w) / 2, 0);
      
      // Ensure modal stays within viewport for auto-sized modals
      if (this.isAutoSize()) {
        const maxLeft = window.innerWidth - w - 20;
        const maxTop = window.innerHeight - h - 20;
        
        this.left = Math.max(20, Math.min(this.left, maxLeft));
        this.top = Math.max(20, Math.min(this.top, maxTop));
      }
      
      this.cdr.detectChanges();
    }, 10);
  }

  onBackdropClick(event: MouseEvent) {
    // Only close if clicked directly on backdrop (not on modal content)
    if (event.target === event.currentTarget && this.config.closeOnBackdropClick) {
      this.close();
    }
  }

  close() {
    // Notify service about modal closure (important for minimized tracking)
    this.modalService.notifyModalClosed(this.modalRef);
    this.modalRef.close();
  }

  minimize() {
    if (this.isMinimized) return;
    
    // Save current bounds including actual dimensions
    const rect = this.modalElement?.getBoundingClientRect();
    this.savedBounds = {
      top: this.top,
      left: this.left,
      width: rect ? rect.width + 'px' : (this.config.width || 'auto'),
      height: rect ? rect.height + 'px' : (this.config.height || 'auto')
    };
    
    this.isMinimized = true;
    
    // Calculate minimized position based on number of minimized modals
    this.minimizedIndex = this.modalService.getMinimizedModalCount();
    const minimizedWidth = 300; // Width of minimized modal
    const minimizedHeight = 40; // Height of minimized modal
    const spacing = 10; // Space between minimized modals
    const bottomMargin = 20; // Margin from bottom of screen
    const leftMargin = 20; // Margin from left of screen
    
    // Calculate position: left margin + (width + spacing) * index
    this.left = leftMargin + (minimizedWidth + spacing) * this.minimizedIndex;
    this.top = window.innerHeight - minimizedHeight - bottomMargin;
    
    // Ensure we don't go off screen horizontally
    const maxLeft = window.innerWidth - minimizedWidth - leftMargin;
    if (this.left > maxLeft) {
      // If we exceed screen width, wrap to next row
      const itemsPerRow = Math.floor((window.innerWidth - leftMargin * 2) / (minimizedWidth + spacing));
      const row = Math.floor(this.minimizedIndex / itemsPerRow);
      const col = this.minimizedIndex % itemsPerRow;
      
      this.left = leftMargin + (minimizedWidth + spacing) * col;
      this.top = window.innerHeight - minimizedHeight - bottomMargin - (minimizedHeight + spacing) * row;
    }
    
    // Notify service about minimization
    this.modalService.notifyModalMinimized(this.modalRef);
    
    this.cdr.detectChanges();
  }

  restore() {
    if (!this.isMinimized || !this.savedBounds) return;
    
    // Notify service about restoration
    this.modalService.notifyModalRestored(this.modalRef);
    
    this.isMinimized = false;
    
    // Check if the saved position is still valid (within viewport bounds)
    const savedLeft = this.savedBounds.left;
    const savedTop = this.savedBounds.top;
    
    // Get approximate modal dimensions (use saved or default)
    const modalWidth = parseInt(this.savedBounds.width) || 600;
    const modalHeight = parseInt(this.savedBounds.height) || 400;
    
    // Check if saved position is within current viewport
    const isValidPosition = savedLeft >= 0 && 
                         savedTop >= 0 && 
                         savedLeft + modalWidth <= window.innerWidth && 
                         savedTop + modalHeight <= window.innerHeight;
  
    if (isValidPosition) {
      // Restore to saved position
      this.top = savedTop;
      this.left = savedLeft;
    } else {
      // Center the modal if saved position is invalid
      this.top = Math.max((window.innerHeight - modalHeight) / 2, 40);
      this.left = Math.max((window.innerWidth - modalWidth) / 2, 0);
    }
    
    // Re-center if it was an auto-size modal (only if position was invalid)
    if (this.isAutoSize() && !isValidPosition) {
      setTimeout(() => this.centerModal(), 10);
    } else {
      this.cdr.detectChanges();
    }
  }

  toggleMinimize() {
    if (this.isMinimized) {
      this.restore();
    } else {
      this.minimize();
    }
  }

  onDragStart(event: MouseEvent) {
    if (!this.config.draggable || this.isMinimized) return;

    // Prevent dragging when clicking on action buttons
    const target = event.target as HTMLElement;
    if (target.classList.contains('action-btn') || target.closest('.action-btn')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    
    // Calculate exact offset from mouse to modal's current position
    this.dragOffset.x = event.clientX - this.left;
    this.dragOffset.y = event.clientY - this.top;
    
    this.dragging = true;
    
    // Add dragging class for visual feedback
    if (this.modalElement) {
      this.modalElement.classList.add('dragging');
    }
    
    // Use capture phase for better performance
    document.addEventListener('mousemove', this.onDragging, { capture: true });
    document.addEventListener('mouseup', this.onDragEnd, { capture: true });
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }

  onDragging = (event: MouseEvent) => {
    if (!this.dragging) return;
    
    event.preventDefault();
    
    // Calculate new position based on mouse position minus offset
    const newLeft = event.clientX - this.dragOffset.x;
    const newTop = event.clientY - this.dragOffset.y;
    
    // Apply boundaries to keep modal visible
    const modalWidth = this.modalElement?.offsetWidth || 300;
    const modalHeight = this.modalElement?.offsetHeight || 200;
    
    // Keep at least 50px of the modal visible on each side
    const minLeft = -modalWidth + 50;
    const maxLeft = window.innerWidth - 50;
    const minTop = 0;
    const maxTop = window.innerHeight - 50;
    
    // Update the component properties directly
    this.left = Math.max(minLeft, Math.min(maxLeft, newLeft));
    this.top = Math.max(minTop, Math.min(maxTop, newTop));
    
    // Apply position immediately using style properties
    if (this.modalElement) {
      this.modalElement.style.left = this.left + 'px';
      this.modalElement.style.top = this.top + 'px';
    }
  };

  onDragEnd = () => {
    if (!this.dragging) return;
    
    this.dragging = false;
    
    // Remove dragging class
    if (this.modalElement) {
      this.modalElement.classList.remove('dragging');
    }
    
    // Restore text selection
    document.body.style.userSelect = '';
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.onDragging, { capture: true });
    document.removeEventListener('mouseup', this.onDragEnd, { capture: true });
    
    // Final position update with change detection
    this.cdr.detectChanges();
  };

  setupFocusTrap() {
    setTimeout(() => {
      if (!this.modalElement) return;
      
      const focusableEls = this.modalElement.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if (focusableEls.length) (focusableEls[0] as HTMLElement).focus();

      this.modalElement.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const first = focusableEls[0] as HTMLElement;
          const last = focusableEls[focusableEls.length - 1] as HTMLElement;
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); 
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); 
            first.focus();
          }
        }
        if (e.key === 'Escape' && !this.isMinimized && this.config.closeOnEscape !== false) {
          this.close();
        }
      });
    });
  }

  private setupGlobalKeyboardHandlers() {
    document.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  private handleGlobalKeyDown = (event: KeyboardEvent) => {
    // Only handle if this is the topmost modal
    if (this.zIndex !== lastZIndex) return;

    switch (event.key) {
      case 'Escape':
        if (this.config.closeOnEscape !== false && !this.isMinimized) {
          event.preventDefault();
          this.close();
        }
        break;
      
      case 'Tab':
        // Focus trap is handled in setupFocusTrap
        break;
    }
  };

  ngOnDestroy() {
    if (this.dragging) this.onDragEnd();
    
    // Remove modal-specific event listeners
    if (this.modalElement) {
      this.modalElement.removeEventListener('mousedown', this.onModalMouseDown);
    }
    
    // Cleanup global event listeners
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', this.onDragging, { capture: true });
    document.removeEventListener('mouseup', this.onDragEnd, { capture: true });
  }
}