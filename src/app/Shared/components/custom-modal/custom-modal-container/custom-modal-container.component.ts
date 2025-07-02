import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CustomModalService } from '../custom-modal.service';
import { CustomModalPopupComponent } from '../custom-modal-popup/custom-modal-popup.component';

@Component({
  selector: 'app-custom-modal-container',
  standalone: false,

  templateUrl: './custom-modal-container.component.html',
  styleUrl: './custom-modal-container.component.scss'
})
export class CustomModalContainerComponent implements OnInit {
  @ViewChild('modalOutlet', { read: ViewContainerRef, static: true })
  modalOutlet!: ViewContainerRef;

  constructor(private modalService: CustomModalService) { }

  ngOnInit() {
    this.modalService.modalEvents$.subscribe(({ config, modalRef }) => {
      const ref = this.modalOutlet.createComponent(CustomModalPopupComponent);
      ref.instance.config = config;
      ref.instance.modalRef = modalRef;

      modalRef.afterClosed().subscribe(() => {
        ref.destroy();
      });
    });
  }

}