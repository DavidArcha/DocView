import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DropdownItem } from '../../../interfaces/table-dropdown.interface';
import { SearchService } from '../../../services/search.service';
import { LanguageService } from '../../../services/language.service';
import { tableDropdownData } from '../../../common/table-dropdown';

@Component({
  selector: 'app-testing-dropdown',
  standalone: false,
  templateUrl: './testing-dropdown.component.html',
  styleUrl: './testing-dropdown.component.scss'
})
export class TestingDropdownComponent implements OnInit {
  // List view data
  listData: DropdownItem[] = [];
  selectedListValue: DropdownItem | DropdownItem[] | null = null;
  selectedValueIds: string[] = [];
  currentLanguage = 'en';

  // Table view data
  tableData: DropdownItem[] = [];
  selectedTableValue: DropdownItem | DropdownItem[] | null = null;
  selectedTableIds: string[] = [];
  tableColumns: string[] = ['column1', 'column2']; // Column names for table view

  // View toggles
  showListView = true;

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.language$.subscribe(lang => {
      this.loadSystemFields(lang);
      this.currentLanguage = lang;
    });

    // Initialize table data
    this.initTableData();

    // Load from localStorage if available
    this.loadSelectedValuesFromStorage();
  }

  // Load System Fields for list view
  loadSystemFields(lang: string): void {
    this.searchService.getSystemTypeFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.listData = fields.map(field => ({
            id: field.id.toString(),
            label: field.label
          }));

          // Update selected values after data is loaded
          this.updateSelectedValueIds();
          this.changeDtr.detectChanges();
        }
      },
      error: console.error
    });
  }

  // Initialize table data from the static data
  initTableData(): void {
    this.tableData = tableDropdownData.map(item => ({
      id: item.id,
      label: item.label,
      tableData: {
        column1: item.column1,
        column2: item.column2
      }
    }));
    this.changeDtr.detectChanges();
  }

  // Update selectedValueIds from selectedListValue 
  updateSelectedValueIds(): void {
    if (!this.selectedListValue) {
      this.selectedValueIds = [];
      return;
    }

    if (Array.isArray(this.selectedListValue)) {
      this.selectedValueIds = this.selectedListValue.map(item => item.id);
    } else {
      this.selectedValueIds = [this.selectedListValue.id];
    }
  }

  // Update selectedTableIds from selectedTableValue 
  updateSelectedTableIds(): void {
    if (!this.selectedTableValue) {
      this.selectedTableIds = [];
      return;
    }

    if (Array.isArray(this.selectedTableValue)) {
      this.selectedTableIds = this.selectedTableValue.map(item => item.id);
    } else {
      this.selectedTableIds = [this.selectedTableValue.id];
    }
  }

  // Load selected values from localStorage
  loadSelectedValuesFromStorage(): void {
    // Load list values
    const savedListValue = localStorage.getItem('selectedListValue');
    if (savedListValue) {
      try {
        this.selectedListValue = JSON.parse(savedListValue);
        this.updateSelectedValueIds();
      } catch (e) {
        console.error('Error parsing saved list values', e);
        this.selectedListValue = null;
        this.selectedValueIds = [];
      }
    }

    // Load table values
    const savedTableValue = localStorage.getItem('selectedTableValue');
    if (savedTableValue) {
      try {
        this.selectedTableValue = JSON.parse(savedTableValue);
        this.updateSelectedTableIds();
      } catch (e) {
        console.error('Error parsing saved table values', e);
        this.selectedTableValue = null;
        this.selectedTableIds = [];
      }
    }
  }

  // Save selected values to localStorage
  saveSelectedValuesToStorage(type: 'list' | 'table', selectedValues: DropdownItem | DropdownItem[]): void {
    if (type === 'list') {
      localStorage.setItem('selectedListValue', JSON.stringify(selectedValues));
    } else {
      localStorage.setItem('selectedTableValue', JSON.stringify(selectedValues));
    }
  }

  // Handle selected value change for list view
  onSelectedListValueChange(selectedValues: DropdownItem[]): void {
    this.selectedListValue = selectedValues.length === 1 ? selectedValues[0] : selectedValues;
    this.updateSelectedValueIds();
    this.saveSelectedValuesToStorage('list', this.selectedListValue);
  }

  // Handle selected value change for table view
  onSelectedTableValueChange(selectedValues: DropdownItem[]): void {
    this.selectedTableValue = selectedValues.length === 1 ? selectedValues[0] : selectedValues;
    this.updateSelectedTableIds();
    this.saveSelectedValuesToStorage('table', this.selectedTableValue);
  }

  // Toggle between list and table views
  toggleView(): void {
    this.showListView = !this.showListView;
  }
}
