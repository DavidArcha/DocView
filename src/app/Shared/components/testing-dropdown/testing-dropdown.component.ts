import { Component } from '@angular/core';
import { listDropdownData } from '../../common/list-dropdown';
import { tableDropdownData } from '../../common/table-dropdown';
import { ListItem } from '../../interfaces/table-dropdown.interface';

@Component({
  selector: 'app-testing-dropdown',
  standalone: false,

  templateUrl: './testing-dropdown.component.html',
  styleUrl: './testing-dropdown.component.scss'
})
export class TestingDropdownComponent {

  listData = listDropdownData;
  tableData = tableDropdownData;

  // ✅ Define the preselected item
  preselectedItem = { id: 'user', label: 'User' };

  selectedListValue: ListItem | ListItem[] | null = null;
  selectedTableValue: ListItem | ListItem[] | null = null;

  // ✅ Function to capture selected value
  onListSelectionChange(selectedValue: ListItem | ListItem[]) {
    console.log('List Dropdown Selected:', selectedValue);
    this.selectedListValue = selectedValue;
  }

  onTableSelectionChange(selectedValue: ListItem | ListItem[]) {
    console.log('Table Dropdown Selected:', selectedValue);
    this.selectedTableValue = selectedValue;
  }
}
