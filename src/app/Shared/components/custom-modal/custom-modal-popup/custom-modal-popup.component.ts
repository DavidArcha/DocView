import { AfterViewInit, Component, ComponentRef, ElementRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalConfig } from '../modal-config';
import { ModalRef } from '../modal-ref';

@Component({
  selector: 'app-custom-modal-popup',
  standalone: false,

  templateUrl: './custom-modal-popup.component.html',
  styleUrl: './custom-modal-popup.component.scss'
})
export class CustomModalPopupComponent implements OnInit, AfterViewInit {
  @Input() config!: ModalConfig;
  @Input() modalRef!: ModalRef;

  @ViewChild('dynamicContent', { read: ViewContainerRef, static: true })
  dynamicContent!: ViewContainerRef;

  top = 0;
  left = 0;
  zIndex = 1000; // For stacking

  private static lastZIndex = 1000;
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private modalStartTop = 0;
  private modalStartLeft = 0;

  isMinimized = false;
  private lastTop = 0;
  private lastLeft = 0;
  private lastWidth = '';
  private lastHeight = '';

  private componentRef?: ComponentRef<any>;

  // Accessibility
  private focusableEls: HTMLElement[] = [];
  private lastFocusedEl: HTMLElement | null = null;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    // Center modal on screen
    setTimeout(() => this.centerModal(), 0);

    // Assign zIndex for stacking
    this.zIndex = ++CustomModalPopupComponent.lastZIndex;
  }

  ngAfterViewInit() {
    if (this.config.component && this.dynamicContent) {
      this.dynamicContent.clear();
      this.componentRef = this.dynamicContent.createComponent(this.config.component);
      if (this.config.data) {
        Object.assign(this.componentRef.instance, this.config.data);
      }
      if ('modalRef' in this.componentRef.instance) {
        this.componentRef.instance.modalRef = this.modalRef;
      }
    }
    // ...focus trap and autofocus
    this.setupFocusTrap();
    this.autoFocusFirstElement();
  }

  centerModal() {
    const modalEl = this.el.nativeElement.querySelector('.custom-modal');
    if (modalEl) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = modalEl;
      this.left = Math.max((innerWidth - offsetWidth) / 2, 0);
      this.top = Math.max((innerHeight - offsetHeight) / 2, 0);
    }
  }

  onDragStart(event: MouseEvent) {
    if (!this.config.draggable || this.isMinimized) return;

    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.modalStartLeft = this.left;
    this.modalStartTop = this.top;

    document.addEventListener('mousemove', this.onDragging);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  onDragging = (event: MouseEvent) => {
    if (!this.dragging || this.isMinimized) return;
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    this.left = Math.max(this.modalStartLeft + dx, 0);
    this.top = Math.max(this.modalStartTop + dy, 0);
  };

  onDragEnd = (_event: MouseEvent) => {
    this.dragging = false;
    document.removeEventListener('mousemove', this.onDragging);
    document.removeEventListener('mouseup', this.onDragEnd);
  };

  close() {
    this.modalRef.close();
  }

  minimize(event: MouseEvent) {
    event.stopPropagation();
    this.isMinimized = true;
    this.lastTop = this.top;
    this.lastLeft = this.left;
    this.lastWidth = this.config.width || '';
    this.lastHeight = this.config.height || '';
    this.top = window.innerHeight - 60;
    this.left = 20;
    this.config.width = '300px';
    this.config.height = '40px';
  }

  restore(event: MouseEvent) {
    event.stopPropagation();
    this.isMinimized = false;
    this.top = this.lastTop;
    this.left = this.lastLeft;
    this.config.width = this.lastWidth;
    this.config.height = this.lastHeight;
  }

  onBackdropClick(event: MouseEvent) {
    if (this.config.allowBackgroundInteraction) {
      return;
    }
    if (this.config.closeOnBackdropClick) {
      this.close();
    }
  }

  // Focus Trap and Accessibility
  setupFocusTrap() {
    setTimeout(() => {
      const modalEl = this.el.nativeElement.querySelector('.custom-modal');
      this.focusableEls = Array.from(
        modalEl.querySelectorAll(
          'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];

      modalEl.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (!this.focusableEls.length) return;
          const firstEl = this.focusableEls[0];
          const lastEl = this.focusableEls[this.focusableEls.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
        // ESC closes modal
        if (e.key === 'Escape' && !this.isMinimized) {
          this.close();
        }
      });
    });
  }

  autoFocusFirstElement() {
    setTimeout(() => {
      const el: HTMLElement | undefined = this.focusableEls[0];
      if (el) el.focus();
    });
  }
}