import { 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  Component, 
  EventEmitter, 
  HostListener, 
  Input, 
  OnChanges, 
  OnDestroy,
  OnInit, 
  Output, 
  SimpleChanges 
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DropdownService } from '../../services/dropdown.service';
import { LanguageService } from '../../services/language.service';
import { DropdownItem } from '../../interfaces/table-dropdown.interface';

@Component({
  selector: 'app-table-dropdown',
  standalone: false,
  templateUrl: './table-dropdown.component.html',
  styleUrl: './table-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDropdownComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: DropdownItem[] = [];
  @Input() isTableView = false; // New simplified boolean for view type
  @Input() multiSelect = false;
  @Input() selectedLanguage = 'de';
  @Input() useTranslations = false;
  @Input() selectedValues: string[] = [];
  @Input() tableColumns?: string[];
  @Output() selectedValuesChange = new EventEmitter<DropdownItem[]>();

  isOpen = false;
  selectedOptions: DropdownItem[] = [];
  filteredData: DropdownItem[] = [];
  selectedOption = '';
  searchTerm = ''; // For search functionality

  // Generate deterministic ID using timestamp and counter for uniqueness
  private static idCounter = 0;
  readonly dropdownId = `dropdown-${Date.now()}-${TableDropdownComponent.idCounter++}`;
  
  private subscriptions = new Subscription();

  constructor(
    private cd: ChangeDetectorRef, 
    private dropdownService: DropdownService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.dropdownService.activeDropdown$.subscribe((id) => {
        const isActive = id === this.dropdownId;
        if (this.isOpen !== isActive) {
          this.isOpen = isActive;
          this.cd.detectChanges();
        }
      })
    );
    this.initializeSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['selectedValues']) && this.data) {
      this.filteredData = [...this.data];
      this.initializeSelection();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isOpen = false;
      this.dropdownService.setActiveDropdown(null);
      this.cd.detectChanges();
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.dropdownService.setActiveDropdown(this.dropdownId);
      // Reset search when opening
      this.searchTerm = '';
      this.filterItems();
    } else {
      this.dropdownService.setActiveDropdown(null);
    }
    this.cd.detectChanges();
  }

  selectOption(item: DropdownItem): void {
    if (this.multiSelect) {
      const index = this.selectedOptions.findIndex(opt => opt.id === item.id);
      if (index === -1) {
        this.selectedOptions = [...this.selectedOptions, item];
      } else {
        this.selectedOptions = [
          ...this.selectedOptions.slice(0, index),
          ...this.selectedOptions.slice(index + 1)
        ];
      }
      this.selectedValuesChange.emit(this.selectedOptions);
    } else {
      this.selectedOption = this.getDisplayLabel(item);
      this.selectedOptions = [item];
      this.selectedValuesChange.emit([item]);
      this.isOpen = false;
      this.dropdownService.setActiveDropdown(null);
    }
    this.cd.detectChanges();
  }

  isSelected(item: DropdownItem): boolean {
    return this.multiSelect 
      ? this.selectedOptions.some(opt => opt.id === item.id)
      : this.selectedValues.includes(item.id);
  }

  getDisplayLabel(item: DropdownItem): string {
    if (this.useTranslations && item.translations) {
      return item.translations[this.selectedLanguage] || item.label || '';
    }
    return item.label || '';
  }

  getDisplayText(): string {
    if (this.multiSelect) {
      if (this.selectedOptions.length === 0) {
        return this.getPlaceholderText();
      }
      return this.selectedOptions
        .map(item => this.getDisplayLabel(item))
        .join(', ');
    }
    return this.selectedOption || this.getPlaceholderText();
  }

  private getPlaceholderText(): string {
    return this.selectedLanguage === 'de' ? 'Auswählen' : 'Select';
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    if (this.multiSelect) {
      this.selectedOptions = [];
    } else {
      this.selectedOption = '';
      this.selectedValues = [];
    }
    this.selectedValuesChange.emit([]);
    this.cd.detectChanges();
  }

  getTableHeaders(): string[] {
    if (!this.tableColumns && this.data.length > 0 && this.data[0]?.tableData) {
      return Object.keys(this.data[0].tableData);
    }
    return this.tableColumns || [];
  }

  getTableCellValue(item: DropdownItem, column: string): string {
    return item.tableData?.[column] || '';
  }

  toggleSelectAll(): void {
    if (this.selectedOptions.length === this.filteredData.length) {
      this.selectedOptions = [];
    } else {
      this.selectedOptions = [...this.filteredData];
    }
    this.selectedValuesChange.emit(this.selectedOptions);
    this.cd.detectChanges();
  }

  onSearchChange(): void {
    this.filterItems();
    this.cd.detectChanges();
  }

  filterItems(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.data];
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    
    this.filteredData = this.data.filter(item => {
      const label = this.getDisplayLabel(item).toLowerCase();
      
      // Also search in table data if available
      if (this.isTableView && item.tableData) {
        const tableValues = Object.values(item.tableData)
          .map(val => String(val).toLowerCase());
        return label.includes(searchTermLower) || 
               tableValues.some(val => val.includes(searchTermLower));
      }
      
      return label.includes(searchTermLower);
    });
  }

  private initializeSelection(): void {
    if (this.multiSelect) {
      this.selectedOptions = this.data.filter(item => 
        this.selectedValues.includes(item.id)
      );
    } else if (this.selectedValues.length > 0) {
      const selected = this.data.find(item => item.id === this.selectedValues[0]);
      if (selected) {
        this.selectedOption = this.getDisplayLabel(selected);
        this.selectedOptions = [selected];
      }
    }
    this.cd.detectChanges();
  }

  getSearchPlaceholder(): string {
    return this.selectedLanguage === 'de' ? 'Suchen...' : 'Search...';
  }
}