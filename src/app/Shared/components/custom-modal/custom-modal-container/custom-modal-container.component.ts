import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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

  constructor(private modalService: CustomModalService) { }

  ngOnInit() {
    this.modalService.modalEvents$.subscribe(({ config, modalRef }) => {
      // Lock scroll if first modal
      if (this.activeModals.size === 0) {
        document.body.style.overflow = 'hidden';
      }
      // Create modal
      const cmpRef = this.modalOutlet.createComponent(CustomModalPopupComponent);
      cmpRef.instance.config = config;
      cmpRef.instance.modalRef = modalRef;
      this.activeModals.set(modalRef, cmpRef);

      // Close handler
      modalRef.afterClosed().subscribe(() => {
        // Cascade to children if needed
        if (config.closeChildrenOnParentClose) {
          modalRef.children.forEach(child => child.close());
        }
        // Destroy component
        if (config.destroyOnClose !== false) {
          const toDestroy = this.activeModals.get(modalRef);
          if (toDestroy) toDestroy.destroy();
        }
        this.activeModals.delete(modalRef);
        // Restore scroll if last
        if (this.activeModals.size === 0) {
          document.body.style.overflow = '';
        }
      });
    });
  }
}