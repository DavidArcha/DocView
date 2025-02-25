import { Component } from '@angular/core';
import { listDropdownData } from '../../common/list-dropdown';
import { tableDropdownData } from '../../common/table-dropdown';
import { ListItem } from '../../interfaces/table-dropdown.interface';
import { DROPDOWN_DATA } from '../../common/dropdown-data.constant';

@Component({
  selector: 'app-testing-dropdown',
  standalone: false,

  templateUrl: './testing-dropdown.component.html',
  styleUrl: './testing-dropdown.component.scss'
})
export class TestingDropdownComponent {

  dropdownOptions = DROPDOWN_DATA; // Use data as is
  selectedLanguage = 'en'; // Default language
  selectedValue: string = '';

  onDropdownChange(value: string) {
    console.log('Selected Value:', value);
    this.selectedValue = value;
  }
}
