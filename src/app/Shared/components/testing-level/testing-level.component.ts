import { ChangeDetectorRef, Component } from '@angular/core';
import { AccordionItem } from '../../interfaces/accordian-list.interface';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { FieldType, FieldTypeMapping } from '../../enums/field-types.enum';
import { SelectedField } from '../../interfaces/selectedFields.interface';
import { DualOperators, NoValueOperators, OperatorType } from '../../enums/operator-types.enum';

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

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.loadAccordionData(this.selectedLanguage);
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
    const defaultOperator = '';
    const defaultValue = null;

    if (parentLabel && fieldLabel) {
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
        value: field.value
      };
    });

    this.updateLocalStorage();
    this.changeDtr.detectChanges();
  }

  /**
    * When the operator value changes, update the operator and reset the value.
    */
  onOperatorChange(event: { newOperator: string, index: number }): void {
    const field = this.selectedFields[event.index];
    field.operator = event.newOperator;

    if (DualOperators.includes(event.newOperator as OperatorType)) {
      field.value = ['', ''];
    } else if (NoValueOperators.includes(event.newOperator as OperatorType)) {
      field.value = null;
    } else {
      field.value = '';
    }

    this.updateLocalStorage();
  }

  // Save updated table data to localStorage
  updateLocalStorage(): void {
    localStorage.setItem('selectedFields', JSON.stringify(this.selectedFields));
  }
}
