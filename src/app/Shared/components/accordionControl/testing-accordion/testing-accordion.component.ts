import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AccordionItem } from '../../../interfaces/accordian-list.interface';
import { SearchService } from '../../../services/search.service';
import { LanguageService } from '../../../services/language.service';
import { AccordionService } from '../../../services/accordion.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-testing-accordion',
  standalone: false,
  templateUrl: './testing-accordion.component.html',
  styleUrl: './testing-accordion.component.scss'
})
export class TestingAccordionComponent implements OnInit, OnDestroy {
  selectedLanguage: string = 'de'; // Default language
  public sections: AccordionItem[] = [];
  private destroy$ = new Subject<void>();
  public isLoading: boolean = false;

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
    private accordionService: AccordionService
  ) { }

  ngOnInit(): void {
    this.languageService.language$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(lang => {
      this.selectedLanguage = lang;
      this.loadAccordionData(this.selectedLanguage);
    });

    this.accordionService.isLoading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoading => {
      this.isLoading = isLoading;
      this.changeDtr.detectChanges();
    });
  }

  // **Fetch Accordion Data and Generate Fast Lookup Map**
  loadAccordionData(lang: string): void {
    const cachedData = this.accordionService.getAccordionData(lang);
    if (cachedData) {
      this.sections = cachedData;
      return;
    }

    // this.accordionService.setLoadingState(true);
    this.searchService.getAccordionFields(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.sections = fields;
          this.accordionService.setAccordionData(lang, fields);
          console.log("Accordion Data : ", this.sections);
        }
        // this.accordionService.setLoadingState(false);
      },
      error: (err) => {
        console.error(err);
        // this.accordionService.setLoadingState(false);
      }
    });
  }

  // **Handle Field Selection and Store Labels Instead of IDs**
  onFieldSelected(event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }): void {
    console.log("Selected Fields : ", event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}