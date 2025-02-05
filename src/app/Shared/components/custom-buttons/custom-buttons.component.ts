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
    console.log("Row Data :",this.params.data);
  }

  refresh(): boolean {
    return false;
  }
}
