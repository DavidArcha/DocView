import { Subject, Observable } from 'rxjs';

export class ModalRef<T = any> {
  private _afterClosed = new Subject<T | undefined>();

  parent?: ModalRef;
  children: ModalRef[] = [];

  close(result?: T) {
    this._afterClosed.next(result);
    this._afterClosed.complete();
  }

  afterClosed(): Observable<T | undefined> {
    return this._afterClosed.asObservable();
  }
}
