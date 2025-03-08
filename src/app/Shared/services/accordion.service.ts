import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccordionItem } from '../interfaces/accordian-list.interface';

@Injectable({
  providedIn: 'root'
})
export class AccordionService {
  private accordionDataCache: { [lang: string]: AccordionItem[] } = {};
  private expandedStateCache: { [id: string]: boolean } = {};

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  setAccordionData(lang: string, data: AccordionItem[]): void {
    this.accordionDataCache[lang] = data;
  }

  getAccordionData(lang: string): AccordionItem[] | undefined {
    return this.accordionDataCache[lang];
  }

  setExpandedState(id: string, isExpanded: boolean): void {
    this.expandedStateCache[id] = isExpanded;
  }

  getExpandedState(id: string): boolean {
    return this.expandedStateCache[id] ?? false;
  }

  setLoadingState(isLoading: boolean): void {
    this.isLoadingSubject.next(isLoading);
  }

  constructor() { }
}
