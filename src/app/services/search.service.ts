import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchApiUrl = 'https://api.example.com/search'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  /**
   * Searches for documents using the backend API.
   * @param query The search query string.
   */
  search(query: string): Observable<any> {
    return this.http.get<any>(`${this.searchApiUrl}?q=${encodeURIComponent(query)}`)
      .pipe(
        retry(2),  // Retry the request up to 2 times on failure
        catchError(error => {
          console.error('Search API error:', error);
          return throwError(() => new Error('Error occurred while searching.'));
        })
      );
  }
}