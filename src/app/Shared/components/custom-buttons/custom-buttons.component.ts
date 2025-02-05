import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-buttons',
  standalone: false,
  templateUrl: './custom-buttons.component.html',
  styleUrl: './custom-buttons.component.scss'
})
export class CustomButtonsComponent {
  params: any;

  constructor() { }

  agInit(params: any): void {
    this.params = params;
  }

  onClick() {
    if (this.params.action === 'pdf') {
      this.handlePdfClick();
    } else if (this.params.action === 'excel') {
      this.handleExcelClick();
    }
  }

  handlePdfClick() {
    console.log("PDF Row Data:", this.params.data);
    // Implement the logic for PDF button click
  }

  handleExcelClick() {
    console.log("Excel Row Data:", this.params.data);
    // Implement the logic for Excel button click
  }

  refresh(): boolean {
    return false;
  }
}
