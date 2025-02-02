import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: false,
  templateUrl: './not-found.component.html',
  styles: [`
    .not-found {
      text-align: center;
      margin-top: 50px;
      font-size: 24px;
    }
  `]
})
export class NotFoundComponent {}
