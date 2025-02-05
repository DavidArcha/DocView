import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, retry, throwError } from 'rxjs';
import { RestAPICallUrl } from '../../../assets/common/apicalls';

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
}