import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-localized-dropdown',
  standalone: false,
  templateUrl: './localized-dropdown.component.html',
  styleUrl: './localized-dropdown.component.scss'
})
export class LocalizedDropdownComponent implements OnChanges {
  // Array of option objects (e.g., [{ en: 'Yes', de: 'Ja' }, { en: 'No', de: 'Nein' }])
  @Input() options: any[] = [];

  // Currently selected language, e.g., 'en' or 'de'
  @Input() selectedLanguage: string = 'de';

  // The current selected value of the dropdown (using two-way binding)
  @Input() selectedValue: any;
  @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges): void {
    // When options change, update the default value if none is set.
    if (changes['options'] && this.options && this.options.length > 0) {
      this.setDefaultValue();
    }
  }
  /**
  * If no value is currently selected, set the default to the first option's key.
  */
  private setDefaultValue(): void {
    if ((this.selectedValue === undefined || this.selectedValue === null) && this.options.length > 0) {
      this.selectedValue = this.options[0].key;
      this.selectedValueChange.emit(this.selectedValue);
    }
  }

  onValueChange(newValue: any): void {
    this.selectedValue = newValue;
    this.selectedValueChange.emit(newValue);
  }
} 