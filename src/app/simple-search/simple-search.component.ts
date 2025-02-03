import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadSystemFields();
  }

  loadSystemFields(): void {
    this.http.get<SystemField[]>('https://localhost:7185/api/Common/systemfields')
      .subscribe({
        next: (fields) => this.systemFields = fields,
        error: (err) => console.error('Error loading fields:', err)
      });
  }
}
