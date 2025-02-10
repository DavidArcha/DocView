import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';

interface SystemField {
  id: number;
  fieldName: string;
}

@Component({
  selector: 'app-simple-search',
  standalone: false,
  templateUrl: './simple-search.component.html',
  styleUrl: './simple-search.component.scss'
})
export class SimpleSearchComponent implements OnInit {
  systemFields: SystemField[] = [];
  selectedField: string = '';
  selectedLanguage: string = 'de'; // Default language
  dropdownData: any;
  // Selected values for each dropdown (for example, conditions and match)
  selectedCondition: any;
  selectedMatch: any;
  selectedState: any;
  selectedDate: any;

  jsonData: any;
  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
  ) { }

  ngOnInit(): void {
    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.loadSystemFieldsByLang(lang);
    });

    this.searchService.getDropdownData().subscribe(data => {
      this.dropdownData = data;
    });

    // Fetch the JSON file from the assets folder
    this.http.get('/assets/json/division.json').subscribe({
      next: (data) => {
        this.jsonData = Object.values(data);
        console.log('JSON Data:', this.jsonData);
      },
      error: (error) => {
        console.error('Error fetching JSON file:', error);
      }
    });
  }

  loadSystemFieldsByLang(lang: string): void {
    this.searchService.getSystemFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.systemFields = fields;
          this.changeDtr.detectChanges(); // Trigger change detection
        }
      },
      error: console.error
    });
  }
}
