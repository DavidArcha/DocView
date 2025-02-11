import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, retry, throwError } from 'rxjs';
import { RestAPICallUrl } from '../common/apicalls';
import { DROPDOWN_DATA } from '../common/dropdown-data.constant';

interface SystemField {
  id: number;
  fieldName: string;
}
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
    this.apiUrl = 'https://localhost:7185/';
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

  getSystemFields(): Observable<SystemField[]> {
    let url = this.apiUrl + RestAPICallUrl.getSyatemFileds;
    return this.http.get<SystemField[]>(url);
  }

  getSystemFieldsByLang(lang: string): Observable<SystemField[]> {
    let url = `${this.apiUrl}${RestAPICallUrl.getSystemFieldsbyLang}/${lang}`;
    return this.http.get<SystemField[]>(url);
  }

  getDropdownData(): Observable<any> {
    // In a more complex scenario, you could load this data from an assets JSON file using HttpClient.
    return of(DROPDOWN_DATA);
  }

  saveSearchData(data: any): Observable<any> {
    let url = this.apiUrl + RestAPICallUrl.saveSearchData;
    return this.http.post(url, data);
  }
}