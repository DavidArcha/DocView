import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { multilevelTypes } from '../../common/multilevel-accordian';
import { AccordionItem } from '../../interfaces/accordian-list.interface';
import { listDropdownData } from '../../common/list-dropdown';
import { tableDropdownData } from '../../common/table-dropdown';
import { ListItem } from '../../interfaces/table-dropdown.interface';

interface SurveySelections {
  selectedMatch?: string;
  selectedState?: string;
  selectedNumber?: string;
  // add more fields as needed
}

@Component({
  selector: 'app-textsurvey',
  standalone: false,
  templateUrl: './textsurvey.component.html',
  styleUrl: './textsurvey.component.scss'
})
export class TextsurveyComponent implements OnInit {
  selectedLanguage: string = 'de'; // default language

  accordionData: AccordionItem[] = [];
  // Store the selected unique key here
  selectedItemKey: string | null = null;

  
  listData = listDropdownData;
  tableData = tableDropdownData;

  constructor(
  ) { }

  ngOnInit() {
    // Here you could also fetch the data from an API
    this.accordionData = multilevelTypes;
  }

  
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
