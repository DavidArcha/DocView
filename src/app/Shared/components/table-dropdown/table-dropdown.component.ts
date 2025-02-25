import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ListItem, TableItem } from '../../interfaces/table-dropdown.interface';
import { DropdownService } from '../../services/dropdown.service';

@Component({
  selector: 'app-table-dropdown',
  standalone: false,
  templateUrl: './table-dropdown.component.html',
  styleUrl: './table-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDropdownComponent {
  @Input() data: ListItem[] | TableItem[] = [];
  @Input() view: 'list' | 'table' = 'list';
  @Input() multiSelect: boolean = false; // ✅ Multi-Select Toggle
  @Input() preselected?: any; // ✅ Preselect an item

  isOpen = false;
  searchTerm = '';
  selectedOptions: string[] = []; // ✅ Holds multi-selected options
  selectedOption: string = 'Select....'; // ✅ Single selection value
  filteredData: ListItem[] = [];

  @Output() selectedValueChange = new EventEmitter<ListItem | ListItem[]>();

  dropdownId = Math.random().toString(36).substr(2, 9); // Unique ID

  constructor(private cd: ChangeDetectorRef, private dropdownService: DropdownService,) { }

  ngOnInit() {
    this.filteredData = this.data;
    this.dropdownService.activeDropdown$.subscribe((id) => {
      this.isOpen = id === this.dropdownId;
    });
    // Initialize selected values only once
    if (this.multiSelect) {
      this.selectedOptions = Array.isArray(this.preselected)
        ? this.preselected.map((item: any) => item.label)
        : []; // Ensure it's an array or set empty array
    } else {
      this.selectedOption = this.preselected && this.preselected.label ? this.preselected.label : 'Select';
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.dropdownService.setActiveDropdown(this.isOpen ? this.dropdownId : null);
  }

  closeDropdown() {
    this.isOpen = false;
    this.dropdownService.setActiveDropdown(null);
  }

  selectOption(item: any) {
    if (this.multiSelect) {
      const index = this.selectedOptions.indexOf(item.label);
      if (index === -1) {
        this.selectedOptions.push(item.label);
      } else {
        this.selectedOptions.splice(index, 1);
      }
      const selectedObjects = this.data.filter(obj => this.selectedOptions.includes(obj.label));
      this.selectedValueChange.emit(selectedObjects);
    } else {
      this.selectedOption = item.label;
      this.preselected = null; // Ensure preselectedItem does not override selection
      this.selectedValueChange.emit(item);
      this.isOpen = false;
    }
  }

  updateSearch() {
    this.filteredData = this.data.filter((item) =>
      item.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.cd.detectChanges();
  }

  getSelectedText(): string {
    return this.selectedOptions.length > 0 ? this.selectedOptions.join(', ') : 'Select Options....';
  }

  get tableData(): TableItem[] {
    return this.filteredData as TableItem[];
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!event.target || !(event.target as HTMLElement).closest('.dropdown-container')) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isOpen) {
      const currentIndex = this.filteredData.findIndex((item) => this.selectedOptions.includes(item.label));

      if (event.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % this.filteredData.length;
        this.selectedOptions = [this.filteredData[nextIndex].label];
        this.selectedOption = this.filteredData[nextIndex].label;
      } else if (event.key === 'ArrowUp') {
        const prevIndex = (currentIndex - 1 + this.filteredData.length) % this.filteredData.length;
        this.selectedOptions = [this.filteredData[prevIndex].label];
        this.selectedOption = this.filteredData[prevIndex].label;
      } else if (event.key === 'Enter') {
        this.isOpen = false;
      } else if (event.key === 'Escape') {
        this.isOpen = false;
      }
    }
  }

  clearSelection(event: Event) {
    event.stopPropagation(); // Prevents dropdown from toggling
    this.selectedOptions = [];
    this.selectedOption = 'Select';
    this.preselected = null; // Reset preselected item
    this.selectedValueChange.emit(this.multiSelect ? [] : undefined);
  }

  removeItem(itemLabel: string, event: Event) {
    event.stopPropagation(); // Prevents dropdown from toggling
    this.selectedOptions = this.selectedOptions.filter(label => label !== itemLabel);

    // Emit updated selection
    const selectedObjects = this.data.filter(obj => this.selectedOptions.includes(obj.label));
    this.selectedValueChange.emit(selectedObjects);

    // If no items are left, reset to "Select"
    if (this.selectedOptions.length === 0) {
      this.selectedValueChange.emit([]); // Emit empty selection
    }
  }
}