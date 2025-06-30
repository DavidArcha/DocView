import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { multilevelTypes } from '../../common/multilevel-accordian';
import { AccordionItem } from '../../interfaces/accordian-list.interface';

@Component({
  selector: 'app-textsurvey',
  standalone: false,
  templateUrl: './textsurvey.component.html',
  styleUrl: './textsurvey.component.scss'
})
export class TextsurveyComponent implements OnInit {
  selectedLanguage: string = 'de'; // default language

  accordionData: AccordionItem[] = [];
  selectedItemKey: string | null = null;
  
   constructor(
  ) { }

  ngOnInit() {
    this.accordionData = multilevelTypes;
  }
}
