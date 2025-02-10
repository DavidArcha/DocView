import { Component, Input, OnInit } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { accordionDataTypes } from '../../common/accordian';
import { delay, Observable, of } from 'rxjs';

@Component({
  selector: 'app-multilevel-accordion',
  standalone: false,
  templateUrl: './multilevel-accordion.component.html',
  styleUrl: './multilevel-accordion.component.scss'
})
export class MultilevelAccordionComponent implements OnInit {
  public sections: AccordionSection[] = [];
  public isLoading: boolean = true; // Global loading flag

  // Array to store selected fields.
  public selectedFields: Array<{ parent: string, field: string }> = [];

  ngOnInit() {
    this.loadAccordionData();
  }

  loadAccordionData(): void {
    this.isLoading = true;
    this.fetchAccordionData().subscribe(data => {
      this.sections = data;
      this.isLoading = false;
    });
  }

  fetchAccordionData(): Observable<AccordionSection[]> {
    // Sample data based on your JSON structure.
    const data: AccordionSection[] = accordionDataTypes[0].sections;
    // Simulate a 1.5-second delay.
    return of(data).pipe(delay(1500));
  }
  // Called whenever any nested accordion emits a fieldSelected event.
  onFieldSelected(event: { parent: string, field: string }): void {
    // Add the selected field to the list.
    this.selectedFields.push(event);
  }

  // Delete a row from the selected fields table.
  onDeleteSelectedField(index: number): void {
    this.selectedFields.splice(index, 1);
  }

  // Handler for the search button (adjust the logic as needed).
  onSearchSelectedField(selected: { parent: string, field: string }): void {
    // For demonstration, we just show an alert.
    alert(`Search clicked for ${selected.parent} > ${selected.field}`);
  }
}