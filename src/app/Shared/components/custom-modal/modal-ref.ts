import { Subject } from 'rxjs';

export class ModalRef {
  private closedSubject = new Subject<any>();
  private minimizedSubject = new Subject<boolean>();
  private restoredSubject = new Subject<void>();
  
  public parent?: ModalRef;
  public children: ModalRef[] = [];
  public isMinimized = false;

  close(result?: any): void {
    this.closedSubject.next(result);
    this.closedSubject.complete();
  }

  minimize(): void {
    this.isMinimized = true;
    this.minimizedSubject.next(true);
  }

  restore(): void {
    this.isMinimized = false;
    this.minimizedSubject.next(false);
    this.restoredSubject.next();
  }

  afterClosed() {
    return this.closedSubject.asObservable();
  }

  afterMinimized() {
    return this.minimizedSubject.asObservable();
  }

  afterRestored() {
    return this.restoredSubject.asObservable();
  }

  /**
   * Add a child modal to this parent
   */
  addChild(childRef: ModalRef): void {
    if (!this.children.includes(childRef)) {
      this.children.push(childRef);
      childRef.parent = this;
    }
  }

  /**
   * Remove a child modal from this parent
   */
  removeChild(childRef: ModalRef): void {
    const index = this.children.indexOf(childRef);
    if (index > -1) {
      this.children.splice(index, 1);
      childRef.parent = undefined;
    }
  }

  /**
   * Get all descendants (children and their children recursively)
   */
  getAllDescendants(): ModalRef[] {
    const descendants: ModalRef[] = [];
    
    const collectDescendants = (modalRef: ModalRef) => {
      modalRef.children.forEach(child => {
        descendants.push(child);
        collectDescendants(child);
      });
    };
    
    collectDescendants(this);
    return descendants;
  }
}
