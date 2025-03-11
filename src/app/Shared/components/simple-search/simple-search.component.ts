import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { AccordionSection } from '../../common/accordion-section.model';
import { delay, Observable, of } from 'rxjs';
import { accordionDataTypes } from '../../common/accordian';
import { ResultPageService } from '../../services/result-page.service';
import { searchGroupFields } from '../../common/search_groupfields';
import { FieldType, FieldTypeMapping } from '../../enums/field-types.enum';
import { OperatorType, NoValueOperators, DualOperators } from '../../enums/operator-types.enum';
import { SavedGroupAccordionComponent } from '../accordionControl/saved-group-accordion/saved-group-accordion.component';
import { AccordionItem } from '../../interfaces/accordian-list.interface';
import { SelectedField } from '../../interfaces/selectedFields.interface';

interface SystemField {
  id: number;
  fieldName: string;
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
  @ViewChild(SavedGroupAccordionComponent) savedGroupAccordion!: SavedGroupAccordionComponent;
  systemFields: SystemField[] = [];
  selectedField: any = null;
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

  private _showGroupDataOutside: boolean = false;

  public savedGroupFields = searchGroupFields;

  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
    private resultPageService: ResultPageService // Inject the service
  ) { }

  ngOnInit(): void {
    // Load the checkbox state from localStorage
    const showGroupDataOutside = localStorage.getItem('showGroupDataOutside');
    this.showGroupDataOutside = showGroupDataOutside === 'true';

    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.loadAccordionData(this.selectedLanguage);
    });

    this.searchService.getDropdownData().subscribe(data => {
      this.dropdownData = data;
    });

    this.loadAccordionData(this.selectedLanguage);

    // Load table data from localStorage if available
    const stored = localStorage.getItem('selectedFields');
    if (stored) {
      this.selectedFields = JSON.parse(stored);
    }
  }

  set showGroupDataOutside(value: boolean) {
    this._showGroupDataOutside = value;
    localStorage.setItem('showGroupDataOutside', value.toString());
  }

  get showGroupDataOutside(): boolean {
    return this._showGroupDataOutside;
  }

  loadSystemFieldsByLang(lang: string): void {
    this.searchService.getSystemFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          // this.systemFields = fields;
          this.isLoading = false;
          this.changeDtr.detectChanges(); // Trigger change detection
        }
      },
      error: console.error
    });
  }
  loadAccordionData(lang: string): void {
    this.searchService.getAccordionFields(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.sections = fields;
          this.isLoading = false;
          this.changeDtr.detectChanges(); // Trigger change detection
        }
      },
      error: console.error
    });
  }

  /**
     * When a field is selected from the accordion, add a new row.
     * Here we pre-select the operator using the first operator option (if any)
     * and then also pre-populate the value column based on that default operator.
     */
  onFieldSelected(event: { parent: string; field: string; path: string }): void {
    // Find labels for parent and field
    const parentLabel = this.getLabelById(event.parent, this.sections);
    const fieldLabel = this.getLabelById(event.field, this.sections);
    const operatorOptions = this.getOperatorOptions(event.field);
    const defaultOperator = { id: 'select', label: 'Select' }; // Default operator with id and label
    const defaultValue = null;

    if (parentLabel && fieldLabel) {
      // Replace ID-based data with label-based data. // Always add a new field, even if it is a duplicate.
      this.selectedFields.push({
        parent: { id: event.parent, label: parentLabel },
        field: { id: event.field, label: fieldLabel },
        operator: defaultOperator,
        operatorOptions: operatorOptions,
        value: defaultValue
      });
    }
    this.updateLocalStorage();
  }

  getLabelById(id: string, sections: AccordionItem[]): string | null {
    for (const section of sections) {
      if (section.id === id) return section.label;
      if (section.children && section.children.length > 0) {
        const foundLabel = this.getLabelById(id, section.children);
        if (foundLabel) return foundLabel;
      }
    }
    return null; // Return null if no matching ID is found
  }


  /**
   * Returns the operator dropdown options based on the selected field.
   */
  getOperatorOptions(field: string): any[] {
    const fieldLower = field.toLowerCase();
    switch (FieldTypeMapping[fieldLower]) {
      case FieldType.Bool:
        return this.dropdownData.boolOperations;
      case FieldType.Text:
        return this.dropdownData.tOperations;
      case FieldType.Date:
        return this.dropdownData.dateOperations;
      case FieldType.Number:
        return this.dropdownData.numberOperations;
      case FieldType.Dropdown:
        return this.dropdownData.stringOperations;
      default:
        return [];
    }
  }

  /**
   * When the operator value changes, update the operator and reset the value.
   */
  // onOperatorChange(event: { newOperator: string, index: number }): void {
  //   const field = this.selectedFields[event.index];
  //   field.operator = event.newOperator;

  //   if (DualOperators.includes(event.newOperator as OperatorType)) {
  //     field.value = ['', ''];
  //   } else if (NoValueOperators.includes(event.newOperator as OperatorType)) {
  //     field.value = null;
  //   } else {
  //     field.value = '';
  //   }

  //   this.updateLocalStorage();
  // }

  // Delete a row from the selected fields table.
  onDeleteSelectedField(index: number): void {
    this.selectedFields.splice(index, 1);
    this.updateLocalStorage();
    localStorage.removeItem('savedAccordionState');
    // Clear the selected field in SavedGroupAccordionComponent
    if (this.savedGroupAccordion) {
      this.savedGroupAccordion.clearSelectedField();
    }
  }

  onSearchSelectedField(event:any): void {
    // const dataToSend: SearchField = {
    //   parent: event.parent,
    //   field: selected.field,
    //   operator: selected.operator,
    //   value: this.getDefaultValue(selected.operator, selected.value)
    // };
    // this.resultPageService.sendData([dataToSend]);
  }

  getDefaultValue(operator?: string, currentValue?: any): any {
    if (currentValue !== null && currentValue !== undefined) {
      return currentValue;
    }
  }

 

  onGroupFieldTitleClicked(fields: any[]): void {
    this.selectedFields = fields.map(field => ({
      parent: field.parent,
      field: field.field,
      operator: field.operator,
      operatorOptions: this.getOperatorOptions(field.field),
      value: field.value
    }));
    this.updateLocalStorage();
  }

  // New method for handling field selection from app-saved-group-accordion
  onSavedGroupFieldSelected(event: { parent: string, field: string, operator: string, value: any }): void {
    this.selectedFields = [];
    const operatorOptions = this.getOperatorOptions(event.field);
    // this.selectedFields.push({
    //   parent: event.parent,
    //   field: event.field,
    //   operator: event.operator,
    //   operatorOptions: operatorOptions,
    //   value: event.value,
    // });
    this.updateLocalStorage();
  }

  // Save updated table data to localStorage
  updateLocalStorage(): void {
    localStorage.setItem('selectedFields', JSON.stringify(this.selectedFields));
  }

  // New button: Clear
  clearTable(): void {
    this.selectedFields = [];
    localStorage.removeItem('selectedFields');
    localStorage.removeItem('savedAccordionState');
  }

  // New button: Search
  searchTable(): void {
    if (this.selectedFields.length === 0) {
      alert("No fields to search.");
      return;
    }
    const dataToSend = this.selectedFields.map(field => ({
      parent: field.parent,
      field: field.field,
      operator: field.operator,
      value: field.value
    }));
    const payload = {
      name: this.searchName, // Use searchName input or any logic you prefer
      fields: dataToSend,
      showGroupDataOutside: this.showGroupDataOutside // Include the checkbox state
    };
    console.log("Search Payload Prepared: ", payload);
    // Optionally, store payload in a property or call a service later.
  }
  // New button: Store
  storeTable(): void {
    if (this.selectedFields.length === 0) {
      alert("No fields to store.");
      return;
    }
    // Prepare payload like sendTableContent but with payload name from first field
    const dataToSend = this.selectedFields.map(field => ({
      parent: field.parent,
      field: field.field,
      operator: field.operator,
      value: field.value
    }));
    const payload = {
      // Name is taken from the first field's field value
      name: this.selectedFields[0].field,
      fields: dataToSend
    };
    // Call the service to store (or simply log)
    console.log("Store Payload: ", payload);
    // this.resultPageService.sendData(payload).subscribe(response => {
    //   console.log("Data stored successfully:", response);
    // }, error => {
    //   console.error("Error storing data:", error);
    // });
  }
}
