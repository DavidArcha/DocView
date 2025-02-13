import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-localized-dropdown',
  standalone: false,
  templateUrl: './localized-dropdown.component.html',
  styleUrl: './localized-dropdown.component.scss'
})
export class LocalizedDropdownComponent implements OnChanges {
  @Input() options: any[] = [];
  @Input() selectedLanguage: string = 'de';
  @Input() selectedValue: any;
  @Input() placeholder: string = 'Select'; // new placeholder input

  @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();

  private previousSelectedValue: any;

  ngOnChanges(changes: SimpleChanges): void {
    // Only set a default if options are available and no value has been set,
    // but if a placeholder is provided, leave the value empty
    if (changes['options'] && this.options && this.options.length > 0) {
      if (this.selectedValue === undefined || this.selectedValue === null) {
        if (this.placeholder) {
          // If a placeholder is defined, use an empty string so the placeholder option shows.
          this.selectedValue = '';
        } else {
          // Otherwise, fallback to first option (if desired).
          this.selectedValue = this.options[0].key;
          this.selectedValueChange.emit(this.selectedValue);
        }
      }
    }
    if (changes['selectedLanguage'] && !changes['selectedLanguage'].firstChange) {
      this.updateSelectedValueForLanguage();
    }
  }

  private updateSelectedValueForLanguage(): void {
    if (this.previousSelectedValue) {
      const matchingOption = this.options.find(option => option.key === this.previousSelectedValue);
      if (matchingOption) {
        this.selectedValue = matchingOption.key;
        this.selectedValueChange.emit(this.selectedValue);
      }
    }
  }

  onValueChange(newValue: any): void {
    this.previousSelectedValue = newValue;
    this.selectedValue = newValue;
    this.selectedValueChange.emit(newValue);
  }
}