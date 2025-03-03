import { Component, Input } from '@angular/core';
import { listDropdownData } from '../../common/list-dropdown';
import { tableDropdownData } from '../../common/table-dropdown';
import { ListItem } from '../../interfaces/table-dropdown.interface';
import { DROPDOWN_DATA, transformDropdownData } from '../../common/dropdown-data.constant';

@Component({
  selector: 'app-testing-dropdown',
  standalone: false,

  templateUrl: './testing-dropdown.component.html',
  styleUrl: './testing-dropdown.component.scss'
})
export class TestingDropdownComponent {

  // Input to specify the category
  dropdownItems = DROPDOWN_DATA;

  ngOnInit() {

  }
}
