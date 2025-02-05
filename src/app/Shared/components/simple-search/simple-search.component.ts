import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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

  constructor(private http: HttpClient,private searchService: SearchService) { }

  ngOnInit(): void {
    this.loadSystemFields();
  }

  loadSystemFields(): void {
    this.searchService.getSystemFields().subscribe({
      next: (fields) => this.systemFields = fields,
      error: (err) => console.error('Error loading fields:', err)
    });
  }
}
