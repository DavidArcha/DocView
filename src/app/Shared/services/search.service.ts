import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, retry, throwError } from 'rxjs';
import { RestAPICallUrl } from '../common/apicalls';
import { AccordionItem } from '../interfaces/accordian-list.interface';
import { DROPDOWN_DATA } from '../common/dropdown-data.constant';
import { ListItem } from '../interfaces/table-dropdown.interface';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  apiUrl!: any;

  private searchEnabledSubject = new BehaviorSubject<boolean>(false);
  private searchQuerySubject = new BehaviorSubject<string>('');

  searchEnabled$ = this.searchEnabledSubject.asObservable();
  searchQuery$ = this.searchQuerySubject.asObservable();

  constructor(private http: HttpClient) {
    this.apiUrl = 'https://localhost:7156/';
    const savedQuery = localStorage.getItem('searchQuery');
    if (savedQuery) {
      this.searchQuerySubject.next(savedQuery);
      this.searchEnabledSubject.next(true);
    }
  }


  enableSearch(query: string) {
    this.searchQuerySubject.next(query);
    this.searchEnabledSubject.next(true);
    localStorage.setItem('searchQuery', query);
  }

  clearSearch() {
    this.searchQuerySubject.next('');
    localStorage.removeItem('searchQuery');
  }

  getSystemFieldsByLang(lang: string): Observable<ListItem[]> {
    let url = `${this.apiUrl}${RestAPICallUrl.getSyatemFileds}/${lang}`;
    return this.http.get<ListItem[]>(url);
  }

  getDropdownData(): Observable<any> {
    // In a more complex scenario, you could load this data from an assets JSON file using HttpClient.
    return of(DROPDOWN_DATA);
  }

  saveSearchData(data: any): Observable<any> {
    let url = this.apiUrl + RestAPICallUrl.saveSearchData;
    return this.http.post(url, data);
  }

  getAccordionFields(lang: string): Observable<AccordionItem[]> {
    let url = `${this.apiUrl}${RestAPICallUrl.getAccordionData}/${lang}`;
    return this.http.get<AccordionItem[]>(url);
  }
}