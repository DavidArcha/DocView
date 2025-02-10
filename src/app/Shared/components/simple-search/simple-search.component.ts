import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { AccordionSection } from '../../common/accordion-section.model';
import { delay, Observable, of } from 'rxjs';
import { accordionDataTypes } from '../../common/accordian';

interface SystemField {
  id: number;
  fieldName: string;
}

interface SelectedField {
  parent: string;
  field: string;
  operator: string;
  operatorOptions: any[];
  value: any;
}

@Component({
  selector: 'app-simple-search',
  standalone: false,
  templateUrl: './simple-search.component.html',
  styleUrl: './simple-search.component.scss'
})
export class SimpleSearchComponent implements OnInit {
  systemFields: SystemField[] = [];
  selectedField: string = '';
  selectedLanguage: string = 'de'; // Default language
  dropdownData: any;
  // Selected values for each dropdown (for example, conditions and match)
  selectedCondition: any;
  selectedMatch: any;
  selectedState: any;
  selectedDate: any;
  public sections: AccordionSection[] = [];
  public isLoading: boolean = true; // Global loading flag

  // Now each selected field row contains additional properties.
  public selectedFields: SelectedField[] = [];
  jsonData: any;
  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
  ) { }

  ngOnInit(): void {
    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.loadSystemFieldsByLang(lang);
    });

    this.searchService.getDropdownData().subscribe(data => {
      this.dropdownData = data;
    });

    this.loadAccordionData();
  }

  loadSystemFieldsByLang(lang: string): void {
    this.searchService.getSystemFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.systemFields = fields;
          this.changeDtr.detectChanges(); // Trigger change detection
        }
      },
      error: console.error
    });
  }

  loadAccordionData(): void {
    this.isLoading = true;
    this.fetchAccordionData().subscribe(data => {
      this.sections = data;
      this.isLoading = false;
    });
  }

  fetchAccordionData(): Observable<AccordionSection[]> {
    // Sample data based on your JSON structure.
    const data: AccordionSection[] = accordionDataTypes[0].sections;
    // Simulate a 1.5-second delay.
    return of(data).pipe(delay(1500));
  }


  /**
     * When a field is selected from the accordion, add a new row.
     * Here we pre-select the operator using the first operator option (if any)
     * and then also pre-populate the value column based on that default operator.
     */
  onFieldSelected(event: { parent: string, field: string }): void {
    const operatorOptions = this.getOperatorOptions(event.field);
    // Pre-select the default operator using the key from the first operator option.
    const defaultOperator = operatorOptions.length > 0 ? operatorOptions[0].key : '';

    // Pre-populate the value based on the default operator.
    let defaultValue = null;
    if (defaultOperator === 'equals') {
      if (this.dropdownData && this.dropdownData.state && this.dropdownData.state.length > 0) {
        defaultValue = this.dropdownData.state[0].key; // Assumes dropdownData.state is an array of option objects.
      }
    } else if (defaultOperator === 'Start-On') {
      defaultValue = new Date().toISOString().substring(0, 10);
    }
    // For operators such as 'yes', 'no', or 'empty', we leave defaultValue as null.

    this.selectedFields.push({
      parent: event.parent,
      field: event.field,
      operator: defaultOperator, // Use the key (e.g., "equals")
      operatorOptions: operatorOptions,
      value: defaultValue
    });
  }


  /**
    * Returns the operator dropdown options based on the selected field.
    */
  getOperatorOptions(field: string): any[] {
    switch (field.toLowerCase()) {
      case 'age':
        return this.dropdownData.match; // e.g., match options for Age
      case 'types':
        return this.dropdownData.state; // e.g., state options for Types
      case 'name':
        return this.dropdownData.conditions; // conditions options for name
      case 'date':
        return this.dropdownData.date; // date options for date (assumed to exist)
      default:
        return [];
    }
  }

  /**
   * When the operator value changes in a table row, update the operator and set the default value if needed.
   */
  onOperatorChange(newOperator: string, index: number): void {
    this.selectedFields[index].operator = newOperator;
    // Optionally, reset or auto-populate the value based on the new operator.
    if (newOperator === 'equals') {
      if (this.dropdownData && this.dropdownData.state && this.dropdownData.state.length > 0) {
        this.selectedFields[index].value = this.dropdownData.state[0].key;
      } else {
        this.selectedFields[index].value = null;
      }
    } else if (newOperator === 'Start-On') {
      this.selectedFields[index].value = new Date().toISOString().substring(0, 10);
    } else if (newOperator === 'yes' || newOperator === 'no' || newOperator === 'empty') {
      this.selectedFields[index].value = null;
    } else {
      // For any other operators, you might want to set a default value or clear it.
      this.selectedFields[index].value = null;
    }
  }

  // Delete a row from the selected fields table.
  onDeleteSelectedField(index: number): void {
    this.selectedFields.splice(index, 1);
  }

  // Handler for the search button (adjust the logic as needed).
  onSearchSelectedField(selected: { parent: string, field: string }): void {
    // For demonstration, we just show an alert.
    alert(`Search clicked for ${selected.parent} > ${selected.field}`);
  }

  hasValueColumn(): boolean {
    return this.selectedFields.some(
      field => field.operator && field.operator !== 'empty' && field.operator !== 'yes' && field.operator !== 'no'
    );
  }
}
