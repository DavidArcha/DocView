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
  @Input() preselected?: ListItem; // ✅ Preselect an item

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
    // ✅ Prepopulate the dropdown with the preselected value
    if (this.preselected) {
      this.selectedOptions = [this.preselected.label];
      this.selectedOption = this.preselected.label;
      // ✅ Emit the initial preselected value
      this.selectedValueChange.emit(this.preselected);
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

  selectOption(option: ListItem) {
    if (this.multiSelect) {
      const index = this.selectedOptions.indexOf(option.label);
      if (index === -1) {
        this.selectedOptions.push(option.label);
      } else {
        this.selectedOptions.splice(index, 1);
      }

      // Emit full objects instead of just labels
      const selectedObjects = this.data.filter(item => this.selectedOptions.includes(item.label));
      this.selectedValueChange.emit(selectedObjects);
    } else {
      this.selectedOption = option.label;
      this.selectedValueChange.emit(option);
      this.isOpen = false;
    }
    this.cd.detectChanges();
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
    event.stopPropagation(); // Prevents the dropdown from toggling when clicking the close icon
    this.selectedOption = 'Select';
    this.selectedOptions = [];
    this.selectedValueChange.emit(undefined);
  }
}