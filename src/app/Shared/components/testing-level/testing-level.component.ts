import { ChangeDetectorRef, Component } from '@angular/core';
import { AccordionItem } from '../../interfaces/accordian-list.interface';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { DropdownDataMapping, FieldType, FieldTypeMapping } from '../../enums/field-types.enum';
import { SelectedField } from '../../interfaces/selectedFields.interface';
import { DualOperators, NoValueOperators, OperatorType } from '../../enums/operator-types.enum';

import { DropdownItem, ListItem } from '../../interfaces/table-dropdown.interface';
import { listDropdownData } from '../../common/list-dropdown';

@Component({
  selector: 'app-testing-level',
  standalone: false,
  templateUrl: './testing-level.component.html',
  styleUrl: './testing-level.component.scss'
})
export class TestingLevelComponent {

  selectedField: any = null;
  selectedLanguage: string = 'de'; // Default language
  public sections: AccordionItem[] = [];
  // Now each selected field row contains additional properties.
  public selectedFields: SelectedField[] = [];

  // **Optimized Data Structure for Fast Lookups**
  private labelMap: Map<string, string> = new Map();
  dropdownData: any;

  // table-dropdown integration variables
  listData: ListItem[] = [];
  selectedListValue: ListItem | ListItem[] | null = null;
  preselected: ListItem[] = [];
  stateData: DropdownItem[] = [];
  brandData: DropdownItem[] = [];

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.loadAccordionData(this.selectedLanguage);
      this.loadSystemFields(this.selectedLanguage);
      this.loadStateData(this.selectedLanguage);
      this.loadBrandData(this.selectedLanguage);
      this.loadSelectedValuesFromStorage();
    });

    this.searchService.getDropdownData().subscribe(data => {
      this.dropdownData = data;
    });

    // Load table data from localStorage if available
    const stored = localStorage.getItem('selectedFields');
    if (stored) {
      this.selectedFields = JSON.parse(stored);
      this.refreshSelectedFields();
    }
  }

  // **Fetch Accordion Data and Generate Fast Lookup Map**
  loadAccordionData(lang: string): void {
    this.searchService.getAccordionFields(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.sections = fields;
          this.generateLabelMap(fields); // Generate label map first         

          // Wait until labelMap is populated before refreshing selected fields
          setTimeout(() => {
            this.refreshSelectedFields();
          }, 0);

          this.changeDtr.detectChanges();
        }
      },
      error: console.error
    });
  }

  loadStateData(lang: string): void {
    this.searchService.getStateData(lang).subscribe({
      next: (stateFields) => {
        if (stateFields.length > 0) {
          this.stateData = stateFields.map(field => ({
            id: field.id.toString(),
            label: field.label // Mapping fieldName to label
          }));
          console.log('State Data:', this.stateData);
          this.changeDtr.detectChanges();
        }
      },
      error: console.error
    });
  }

  loadBrandData(lang: string): void {
    this.searchService.getBrandsData(lang).subscribe({
      next: (brandFields) => {
        if (brandFields.length > 0) {
          this.brandData = brandFields.map(field => ({
            id: field.id.toString(),
            label: field.label // Mapping fieldName to label
          }));
          console.log('Brand Data:', this.brandData);
          this.changeDtr.detectChanges();
        }
      },
      error: console.error
    });
  }

  // **Precompute a Map for Fast Label Lookups (O(1))**
  private generateLabelMap(sections: AccordionItem[]): void {
    this.labelMap.clear();
    const stack = [...sections];

    while (stack.length > 0) {
      const section = stack.pop()!;
      this.labelMap.set(section.id, section.label);
      if (section.children && section.children.length > 0) {
        stack.push(...section.children);
      }
    }
  }

  // **Optimized O(1) Label Lookup Instead of Recursive Search**
  getLabelById(id: string): string | null {
    return this.labelMap.get(id) || null;
  }

  // **Handle Field Selection and Store Labels Instead of IDs**
  onFieldSelected(event: { parent: string; field: string; path: string }): void {
    const parentLabel = this.getLabelById(event.parent);
    const fieldLabel = this.getLabelById(event.field);
    const operatorOptions = this.getOperatorOptions(event.field);

    // Initialize with default operator object
    const defaultOperator = {
      id: 'select',
      label: this.selectedLanguage === 'de' ? 'Auswählen' : 'Select'
    };
    const defaultValue = null;
    const dropdownData = this.getDropdownDataForField(event.field) || [];

    if (parentLabel && fieldLabel) {
      this.selectedFields.push({
        parent: { id: event.parent, label: parentLabel },
        field: { id: event.field, label: fieldLabel },
        operator: defaultOperator,
        operatorOptions: operatorOptions,
        value: defaultValue,
        dropdownData: dropdownData
      });
    }
    this.updateLocalStorage();
  }

  // Save updated table data to localStorage
  updateLocalStorage(): void {
    localStorage.setItem('selectedFields', JSON.stringify(this.selectedFields));
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

  // **Update Selected Fields' Labels on Language Change**
  refreshSelectedFields(): void {
    this.selectedFields = this.selectedFields.map(field => {
      const parentLabel = this.getLabelById(field.parent.id);
      const fieldLabel = this.getLabelById(field.field.id);

      // For dropdown fields, ensure the dropdown data is refreshed
      const dropdownData = this.getDropdownDataForField(field.field.id);

      // If value is present and it's a dropdown value, refresh its label according to current language
      let value = field.value;
      if (value && field.dropdownData && field.dropdownData.length > 0) {
        if (Array.isArray(value)) {
          // Handle array of selected values
          value = value.map(v => {
            const matchingItem = dropdownData.find(item => item.id === v.id);
            return matchingItem || v;
          });
        } else if (typeof value === 'object' && 'id' in value) {
          // Handle single selected value
          const matchingItem = dropdownData.find(item => item.id === value.id);
          value = matchingItem || value;
        }
      }

      return {
        parent: {
          id: field.parent.id,
          label: parentLabel || field.parent.label
        },
        field: {
          id: field.field.id,
          label: fieldLabel || field.field.label
        },
        operator: field.operator,
        operatorOptions: field.operatorOptions,
        value: value,
        operatorTouched: field.operatorTouched,
        valueTouched: field.valueTouched,
        dropdownData: dropdownData
      };
    });

    this.updateLocalStorage();
    this.changeDtr.detectChanges();
  }

  // ✅ Function to capture selected value
  onListSelectionChange(selectedValue: ListItem | ListItem[]) {
    console.log('List Dropdown Selected:', selectedValue);
    this.selectedListValue = selectedValue;
  }

  // Load System Fields
  loadSystemFields(lang: string): void {
    this.searchService.getSystemFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          // this.listData = fields.map(field => ({
          //   id: field.id.toString(),
          //   label: field.label // Mapping fieldName to label
          // }));
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

  // Delete a row from the selected fields table.
  onDeleteSelectedField(index: number): void {
    this.selectedFields.splice(index, 1);
    this.updateLocalStorage();
    localStorage.removeItem('savedAccordionState');
  }

  onSearchSelectedField(event: any): void {
    // const dataToSend: SearchField = {
    //   parent: event.parent,
    //   field: selected.field,
    //   operator: selected.operator,
    //   value: this.getDefaultValue(selected.operator, selected.value)
    // };
    // this.resultPageService.sendData([dataToSend]);
  }

  /**
   * When the operator value changes, update the operator and reset the value.
   */
  onOperatorChange(event: { newOperator: string, index: number }): void {
    const field = this.selectedFields[event.index];

    if (!field) {
      return;
    }

    // Handle 'select' option selection
    if (event.newOperator === 'select') {
      field.operator = {
        id: 'select',
        label: this.selectedLanguage === 'de' ? 'Auswählen' : 'Select'
      };
      field.value = null;
      field.operatorTouched = true;
      this.updateLocalStorage();
      return;
    }

    const selectedOption = field.operatorOptions.find(op => op.id === event.newOperator);

    if (selectedOption) {
      field.operator = {
        id: selectedOption.id,
        label: selectedOption[this.selectedLanguage] || selectedOption.id
      };

      // Reset value based on operator type
      if (DualOperators.includes(selectedOption.id as OperatorType)) {
        field.value = ['', ''];
      } else if (NoValueOperators.includes(selectedOption.id as OperatorType)) {
        field.value = null;
      } else {
        field.value = '';
      }

      field.operatorTouched = true;
      this.updateLocalStorage();
    }
  }

  getDropdownDataForField(fieldId: string): any[] {
    const dataSource = DropdownDataMapping[fieldId.toLowerCase()];
    switch (dataSource) {
      case 'stateData':
        return this.stateData;
      case 'brandData':
        return this.brandData;
      default:
        return [];
    }
  }
}
