import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig } from './modal-config';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class CustomModalService {
  private modals$ = new Subject<{ config: ModalConfig, modalRef: ModalRef }>();

  /**
   * Opens a modal with the given config. If a parent is provided, links parent-child.
   */
  open(config: ModalConfig, parentRef?: ModalRef): ModalRef {
    const modalRef = new ModalRef();
    if (parentRef) {
      modalRef.parent = parentRef;
      parentRef.children.push(modalRef);
    }
    this.modals$.next({ config, modalRef });
    return modalRef;
  }

  get modalEvents$() {
    return this.modals$.asObservable();
  }
}