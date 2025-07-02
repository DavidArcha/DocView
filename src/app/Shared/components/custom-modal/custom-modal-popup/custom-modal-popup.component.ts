import { AfterViewInit, ChangeDetectionStrategy, Component, ComponentFactoryResolver, ComponentRef, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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

  isMinimized = false;
  zIndex = 0;
  top = 0;
  left = 0;
  private dragging = false;
  private dragOffset = { x: 0, y: 0 };
  private savedBounds: { top: number, left: number, width: string, height: string } | null = null;

  constructor(
    public el: ElementRef,
    private cfr: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    this.zIndex = ++lastZIndex;
    setTimeout(() => this.centerModal());
  }

  ngAfterViewInit() {
    if (this.config.component && !this.config.template && this.dynamicContent) {
      const compFactory = this.cfr.resolveComponentFactory(this.config.component);
      const compRef = this.dynamicContent.createComponent(compFactory);
      Object.assign(compRef.instance, this.config.data || {});
      if ('modalRef' in compRef.instance) {
        (compRef.instance as any).modalRef = this.modalRef;
      }
    }
    this.setupFocusTrap();
  }

  centerModal() {
    const modalEl = this.el.nativeElement.querySelector('.custom-modal');
    if (!modalEl) return;
    const w = modalEl.offsetWidth, h = modalEl.offsetHeight;
    this.top = Math.max((window.innerHeight - h) / 2, 40);
    this.left = Math.max((window.innerWidth - w) / 2, 0);
  }

  onBackdropClick(event: MouseEvent) {
    if (this.config.closeOnBackdropClick) this.close();
  }

  close() {
    this.modalRef.close();
  }

  minimize() {
    if (this.isMinimized) return;
    const modalEl = this.el.nativeElement.querySelector('.custom-modal');
    this.savedBounds = {
      top: this.top,
      left: this.left,
      width: this.config.width || modalEl.style.width || '',
      height: this.config.height || modalEl.style.height || ''
    };
    this.isMinimized = true;
    this.top = window.innerHeight - 40;
    this.left = 0;
  }

  restore() {
    if (!this.isMinimized || !this.savedBounds) return;
    this.isMinimized = false;
    this.top = this.savedBounds.top;
    this.left = this.savedBounds.left;
  }

  onDragStart(event: MouseEvent) {
    if (!this.config.draggable) return;
    event.preventDefault();
    this.dragging = true;
    this.dragOffset.x = event.clientX - this.left;
    this.dragOffset.y = event.clientY - this.top;
    document.addEventListener('mousemove', this.onDragging);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  onDragging = (event: MouseEvent) => {
    if (!this.dragging) return;
    this.left = event.clientX - this.dragOffset.x;
    this.top = event.clientY - this.dragOffset.y;
  };

  onDragEnd = () => {
    this.dragging = false;
    document.removeEventListener('mousemove', this.onDragging);
    document.removeEventListener('mouseup', this.onDragEnd);
  };

  setupFocusTrap() {
    setTimeout(() => {
      const modalEl = this.el.nativeElement.querySelector('.custom-modal');
      const focusableEls = modalEl.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if (focusableEls.length) (focusableEls[0] as HTMLElement).focus();

      modalEl.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const first = focusableEls[0] as HTMLElement;
          const last = focusableEls[focusableEls.length - 1] as HTMLElement;
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
        // Only close on Escape if allowed
        if (e.key === 'Escape' && !this.isMinimized && this.config.closeOnEscape !== false) {
          this.close();
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.dragging) this.onDragEnd();
  }
}