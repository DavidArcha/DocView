import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SearchService } from '../../services/search.service';

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
  selectedLanguage: string = 'en'; // Default language

  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSystemFieldsByLang(this.selectedLanguage);
  }

  loadSystemFieldsByLang(lang: string): void {
    console.log(lang);
    this.searchService.getSystemFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          console.log(fields);
          this.systemFields = fields;
          console.log(this.systemFields);
          this.selectedField = fields[0].fieldName;
          this.changeDtr.detectChanges(); // Trigger change detection
        }
      },
      error: console.error
    });
  }
}
