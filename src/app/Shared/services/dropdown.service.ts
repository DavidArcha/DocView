import { Injectable } from '@angular/core';
import { ListItem } from '../interfaces/table-dropdown.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private selectedValuesMap = new Map<string, BehaviorSubject<ListItem[] | null>>();

  // ✅ Get the selected values for a specific dropdown instance
  getSelectedValues(key: string): BehaviorSubject<ListItem[] | null> {
    if (!this.selectedValuesMap.has(key)) {
      this.selectedValuesMap.set(key, new BehaviorSubject<ListItem[] | null>(null));
    }
    return this.selectedValuesMap.get(key)!;
  }

  // ✅ Set selected values for a specific dropdown instance
  setSelectedValues(key: string, values: ListItem[]) {
    if (!this.selectedValuesMap.has(key)) {
      this.selectedValuesMap.set(key, new BehaviorSubject<ListItem[] | null>(values));
    } else {
      this.selectedValuesMap.get(key)!.next(values);
    }
  }
}