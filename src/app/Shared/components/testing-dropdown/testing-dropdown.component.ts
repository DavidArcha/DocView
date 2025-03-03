import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ListItem } from '../../interfaces/table-dropdown.interface';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-testing-dropdown',
  standalone: false,
  templateUrl: './testing-dropdown.component.html',
  styleUrl: './testing-dropdown.component.scss'
})
export class TestingDropdownComponent implements OnInit {

  listData: ListItem[] = [];
  selectedListValue: ListItem | ListItem[] | null = null;
  preselected: ListItem[] = [];

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageService.language$.subscribe(lang => {
      this.loadSystemFields(lang);
    });
    this.loadSelectedValuesFromStorage();
  }

  // Load System Fields
  loadSystemFields(lang: string): void {
    this.searchService.getSystemFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.listData = fields.map(field => ({
            id: field.id.toString(),
            label: field.label // Mapping fieldName to label
          }));
          this.updatePreselectedValues();
          this.changeDtr.detectChanges();
        }
      },
      error: console.error
    });
  }

  // Save selected values to localStorage
  saveSelectedValuesToStorage(selectedValues: ListItem | ListItem[]): void {
    localStorage.setItem('selectedListValue', JSON.stringify(selectedValues));
  }

  // Load selected values from localStorage
  loadSelectedValuesFromStorage(): void {
    const storedValues = localStorage.getItem('selectedListValue');
    if (storedValues) {
      this.preselected = JSON.parse(storedValues);
    }
  }

  // Update preselected values based on the current listData
  updatePreselectedValues(): void {
    if (this.preselected.length > 0) {
      const preselectedIds = this.preselected.map(item => item.id);
      this.preselected = this.listData.filter(item => preselectedIds.includes(item.id));
    }
  }

  // Handle selected value change
  onSelectedValueChange(selectedValues: ListItem | ListItem[]): void {
    this.selectedListValue = selectedValues;
    this.saveSelectedValuesToStorage(selectedValues);
  }
}
