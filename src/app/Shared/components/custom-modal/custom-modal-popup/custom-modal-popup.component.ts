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

  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private modalStartTop = 0;
  private modalStartLeft = 0;

  private componentRef?: ComponentRef<any>;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Center modal on screen
    setTimeout(() => this.centerModal(), 0);
  }

  ngAfterViewInit() {
    if (this.config.component) {
      this.dynamicContent.clear();
      this.componentRef = this.dynamicContent.createComponent(this.config.component);
      if (this.config.data) {
        Object.assign(this.componentRef.instance, this.config.data);
      }
      if ('modalRef' in this.componentRef.instance) {
        this.componentRef.instance.modalRef = this.modalRef;
      }
    }
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
    if (!this.config.draggable) return;

    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.modalStartLeft = this.left;
    this.modalStartTop = this.top;

    document.addEventListener('mousemove', this.onDragging);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  onDragging = (event: MouseEvent) => {
    if (!this.dragging) return;
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
}