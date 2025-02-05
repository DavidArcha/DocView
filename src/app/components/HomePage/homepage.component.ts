import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../../Shared/services/search.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {

  globelSearchForm!: FormGroup;
  isLoading: boolean = false;

  constructor(private searchService: SearchService, private router: Router) { }

  ngOnInit(): void {
    this.initialForm();
    this.searchService.searchQuery$.subscribe(query => {
      this.globelSearchForm.get('searchKey')?.setValue(query);
    });
  }

  initialForm() {
    this.globelSearchForm = new FormGroup({
      searchKey: new FormControl('', {}),
    });
  }

  onSearch(): void {
    const searchQuery = this.globelSearchForm.get('searchKey')?.value;
    if (searchQuery) {
      this.isLoading = true;
      this.router.navigate(['/resultpage']);    
      this.searchService.enableSearch(searchQuery);
    }
  }

  onClear(): void {
    this.searchService.clearSearch();
  }
}
