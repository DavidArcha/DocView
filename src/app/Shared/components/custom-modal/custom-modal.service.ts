import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig } from './modal-config';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class CustomModalService {
  private modals$ = new Subject<{ config: ModalConfig, modalRef: ModalRef }>();

  open(config: ModalConfig): ModalRef {
    const modalRef = new ModalRef();
    this.modals$.next({ config, modalRef });
    return modalRef;
  }

  get modalEvents$() {
    return this.modals$.asObservable();
  }
}
