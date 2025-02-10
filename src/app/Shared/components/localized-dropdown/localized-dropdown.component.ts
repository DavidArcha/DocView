import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-localized-dropdown',
  standalone: false,
  templateUrl: './localized-dropdown.component.html',
  styleUrl: './localized-dropdown.component.scss'
})
export class LocalizedDropdownComponent {
   // Array of option objects (e.g., [{ en: 'Yes', de: 'Ja' }, { en: 'No', de: 'Nein' }])
   @Input() options: any[] = [];

   // Currently selected language, e.g., 'en' or 'de'
   @Input() selectedLanguage: string = 'de';
 
   // The current selected value of the dropdown (using two-way binding)
   @Input() selectedValue: any;
   @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();
 
   onValueChange(newValue: any) {
     this.selectedValue = newValue;
     this.selectedValueChange.emit(newValue);
   }
 } 