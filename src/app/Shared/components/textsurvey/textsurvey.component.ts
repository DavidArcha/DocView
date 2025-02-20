import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { multilevelTypes } from '../../common/multilevel-accordian';
import { AccordionItem } from '../../interfaces/accordian-list.interface';

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


  constructor(
  ) { }

  ngOnInit() {
    // Here you could also fetch the data from an API
    this.accordionData = multilevelTypes;
  }
}
