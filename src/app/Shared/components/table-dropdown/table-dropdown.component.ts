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
  selectedOption: string = 'Select Options....'; // ✅ Single selection value
  filteredData: ListItem[] = [];

  @Output() selectedValueChange = new EventEmitter<ListItem | ListItem[]>();

  constructor(private cd: ChangeDetectorRef,private dropdownService: DropdownService,) { }

  ngOnInit() {
    this.filteredData = this.data;

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
  }

  selectOption(option: ListItem) {
    if (this.multiSelect) {
      if (this.selectedOptions.includes(option.label)) {
        this.selectedOptions = this.selectedOptions.filter((item) => item !== option.label);
      } else {
        this.selectedOptions.push(option.label);
      }

      // ✅ Emit the multi-selected values
      const selectedObjects = this.data.filter(item => this.selectedOptions.includes(item.label));
      this.selectedValueChange.emit(selectedObjects);
    } else {
      this.selectedOptions = [option.label];
      this.selectedOption = option.label;
      this.isOpen = false;

      // ✅ Emit the single selected value
      this.selectedValueChange.emit(option);
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
}