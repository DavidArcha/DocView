import { Subject } from 'rxjs';
import { ModalConfig } from './modal-config';

export interface ModalHeaderUpdate {
  title?: string;
  middleText?: string;
  preActionText?: string;
}

export class ModalRef {
  private closedSubject = new Subject<any>();
  private minimizedSubject = new Subject<boolean>();
  private restoredSubject = new Subject<void>();
  private headerUpdateSubject = new Subject<ModalHeaderUpdate>(); // New subject for header updates
  
  public parent?: ModalRef;
  public children: ModalRef[] = [];
  public isMinimized = false;
  public config?: ModalConfig; // Store reference to config

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

  /**
   * Update modal header fields dynamically
   */
  updateHeader(updates: ModalHeaderUpdate): void {
    if (this.config) {
      // Update the config with new values
      if (updates.title !== undefined) this.config.title = updates.title;
      if (updates.middleText !== undefined) this.config.middleText = updates.middleText;
      if (updates.preActionText !== undefined) this.config.preActionText = updates.preActionText;
    }
    
    // Emit the update
    this.headerUpdateSubject.next(updates);
  }

  /**
   * Update only the title
   */
  updateTitle(title: string): void {
    this.updateHeader({ title });
  }

  /**
   * Update only the middle text
   */
  updateMiddleText(middleText: string): void {
    this.updateHeader({ middleText });
  }

  /**
   * Update only the pre-action text
   */
  updatePreActionText(preActionText: string): void {
    this.updateHeader({ preActionText });
  }

  /**
   * Get observable for header updates
   */
  afterHeaderUpdate() {
    return this.headerUpdateSubject.asObservable();
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
