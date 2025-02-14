import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { AccordionSection } from '../../common/accordion-section.model';
import { delay, Observable, of } from 'rxjs';
import { accordionDataTypes } from '../../common/accordian';
import { ResultPageService } from '../../services/result-page.service';
import { searchGroupFields } from '../../common/search_groupfields';

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

interface SearchField {
  parent: string;
  field: string;
  operator: string;
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
  public searchName: string = ''; // New property for the name
  jsonData: any;

  public showGroupDataOutside: boolean = false;

  public savedGroupFields = searchGroupFields;
  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
    private resultPageService: ResultPageService // Inject the service
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
    const defaultOperator = '';

    // Pre-populate the value based on the default operator.
    let defaultValue = null;

    // Check if the field already exists in the selectedFields array
    const existingFieldIndex = this.selectedFields.findIndex(
      field => field.parent === event.parent && field.field === event.field
    );

    if (existingFieldIndex !== -1) {
      // Update the existing field
      this.selectedFields[existingFieldIndex] = {
        parent: event.parent,
        field: event.field,
        operator: defaultOperator,
        operatorOptions: operatorOptions,
        value: defaultValue
      };
    } else {
      // Add the new field
      this.selectedFields.push({
        parent: event.parent,
        field: event.field,
        operator: defaultOperator,
        operatorOptions: operatorOptions,
        value: defaultValue
      });
    }
  }

  /**
    * Returns the operator dropdown options based on the selected field.
    */
  getOperatorOptions(field: string): any[] {
    switch (field.toLowerCase()) {
      case 'copy':
        return this.dropdownData.boolOperations;
      case 'current':
        return this.dropdownData.boolOperations;
      default:
        return [];
    }
  }

  /**
   * When the operator value changes in a table row, update the operator and set the default value if needed.
   */
  onOperatorChange(event: { newOperator: string, index: number }): void {
    const { newOperator, index } = event;
    this.selectedFields[index].operator = newOperator;
  }

  // Delete a row from the selected fields table.
  onDeleteSelectedField(index: number): void {
    this.selectedFields.splice(index, 1);
  }

  // Handler for the search button (adjust the logic as needed).
  sendTableContent(): void {
    const dataToSend: SearchField[] = this.selectedFields.map(field => ({
      parent: field.parent,
      field: field.field,
      operator: field.operator,
      value: this.getDefaultValue(field.operator, field.value)
    }));
    const payload = {
      name: this.searchName,
      fields: dataToSend
    };
    console.log('Data to send:', payload);
    this.resultPageService.sendData(payload);
    this.searchService.saveSearchData(payload).subscribe(response => {
      console.log('Data saved successfully:', response);
    }, error => {
      console.error('Error saving data:', error);
    });
  }

  onSearchSelectedField(selected: { parent: string, field: string, operator: string, operatorOptions: any[], value: any }): void {
    const dataToSend: SearchField = {
      parent: selected.parent,
      field: selected.field,
      operator: selected.operator,
      value: this.getDefaultValue(selected.operator, selected.value)
    };
    this.resultPageService.sendData([dataToSend]);
  }

  getDefaultValue(operator: string, currentValue: any): any {
    if (currentValue !== null && currentValue !== undefined) {
      return currentValue;
    }
  }

  hasValueColumn(): boolean {
    return this.selectedFields.some(
      field => field.operator && field.operator !== 'empty' && field.operator !== 'yes' && field.operator !== 'no'
    );
  }

  onGroupFieldTitleClicked(fields: any[]): void {
    this.selectedFields = fields.map(field => ({
      parent: field.parent,
      field: field.field,
      operator: field.operator,
      operatorOptions: this.getOperatorOptions(field.field),
      value: field.value
    }));
  }

  // New method for handling field selection from app-saved-group-accordion
  onSavedGroupFieldSelected(event: { parent: string, field: string, operator: string, value: any }): void {
    this.selectedFields = [];
    const operatorOptions = this.getOperatorOptions(event.field);
    const defaultOperator = operatorOptions.length > 0 ? operatorOptions[0].key : '';
    let defaultValue = null;

    if (defaultOperator === 'equals') {
      if (this.dropdownData && this.dropdownData.state && this.dropdownData.state.length > 0) {
        defaultValue = this.dropdownData.state[0].key;
      }
    } else if (defaultOperator === 'Start-On') {
      defaultValue = new Date().toISOString().substring(0, 10);
    }
    this.selectedFields.push({
      parent: event.parent,
      field: event.field,
      operator: event.operator,
      operatorOptions: operatorOptions,
      value: event.value,
    });
  }
}
