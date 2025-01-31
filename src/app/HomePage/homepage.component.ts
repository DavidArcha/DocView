import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  standalone: false,

  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  search(): void {
    console.log('Search button clicked!');
  }
}
