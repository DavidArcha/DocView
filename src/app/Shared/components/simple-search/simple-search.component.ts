import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { AccordionSection } from '../../common/accordion-section.model';
import { delay, Observable, of } from 'rxjs';
import { accordionDataTypes } from '../../common/accordian';
import { ResultPageService } from '../../services/result-page.service';
import { searchGroupFields } from '../../common/search_groupfields';
import { FieldType, FieldTypeMapping } from '../../enums/field-types.enum';
import { OperatorType, NoValueOperators, DualOperators } from '../../enums/operator-types.enum';
import { SavedGroupAccordionComponent } from '../accordionControl/saved-group-accordion/saved-group-accordion.component';
import { AccordionItem } from '../../interfaces/accordian-list.interface';
import { SelectedField } from '../../interfaces/selectedFields.interface';
import { updatedSearchGroupFields } from '../../common/updatedsearch_groupfields';

interface SystemField {
  id: number;
  fieldName: string;
}

interface SearchField {
  parent: string;
  field: string;
  operator: string;
  value: any;
}

@Component({
  selector: 'app-simple-search',
  standalone: false,
  templateUrl: './simple-search.component.html',
  styleUrl: './simple-search.component.scss'
})
export class SimpleSearchComponent implements OnInit {

  selectedField: any = null;
  selectedLanguage: string = 'de'; // Default language 

  private _showGroupDataOutside: boolean = false;

  public savedGroupFields = updatedSearchGroupFields;

  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
    private resultPageService: ResultPageService // Inject the service
  ) { }

  ngOnInit(): void {
    // Load the checkbox state from localStorage
    const showGroupDataOutside = localStorage.getItem('showGroupDataOutside');
    this.showGroupDataOutside = showGroupDataOutside === 'true';

    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
    });

  }

  set showGroupDataOutside(value: boolean) {
    this._showGroupDataOutside = value;
    localStorage.setItem('showGroupDataOutside', value.toString());
  }

  get showGroupDataOutside(): boolean {
    return this._showGroupDataOutside;
  }

}
