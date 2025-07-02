import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalConfig } from '../modal-config';
import { ModalRef } from '../modal-ref';

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

  constructor(
    public el: ElementRef,
    private cfr: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.zIndex = ++lastZIndex;
    this.initializePosition();
  }

  ngAfterViewInit() {
    // Cache modal element reference
    this.modalElement = this.el.nativeElement.querySelector('.custom-modal');

    // Create main component
    if (this.config.component && !this.config.template && this.dynamicContent) {
      const compFactory = this.cfr.resolveComponentFactory(this.config.component);
      const compRef = this.dynamicContent.createComponent(compFactory);
      Object.assign(compRef.instance, this.config.data || {});
      if ('modalRef' in compRef.instance) {
        (compRef.instance as any).modalRef = this.modalRef;
      }
    }

    // Create footer component if specified
    if (this.config.footerComponent && this.dynamicFooter) {
      const footerFactory = this.cfr.resolveComponentFactory(this.config.footerComponent);
      const footerRef = this.dynamicFooter.createComponent(footerFactory);
      Object.assign(footerRef.instance, this.config.footerData || {});
      if ('modalRef' in footerRef.instance) {
        (footerRef.instance as any).modalRef = this.modalRef;
      }
    }

    this.setupFocusTrap();
    
    // Wait for content to render, then center
    setTimeout(() => {
      this.centerModal();
    }, 0);
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
    
    this.top = Math.max((window.innerHeight - defaultHeight) / 2, 40);
    this.left = Math.max((window.innerWidth - defaultWidth) / 2, 0);
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
    if (this.config.closeOnBackdropClick) this.close();
  }

  close() {
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
    this.top = window.innerHeight - 50;
    this.left = 20;
    this.cdr.detectChanges();
  }

  restore() {
    if (!this.isMinimized || !this.savedBounds) return;
    
    this.isMinimized = false;
    this.top = this.savedBounds.top;
    this.left = this.savedBounds.left;
    
    // Re-center if it was an auto-size modal
    if (this.isAutoSize()) {
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

  ngOnDestroy() {
    if (this.dragging) this.onDragEnd();
    
    // Cleanup
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', this.onDragging, { capture: true });
    document.removeEventListener('mouseup', this.onDragEnd, { capture: true });
  }
}