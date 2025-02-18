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
  @Input() placeholder: string = 'DROPDOWN.PLACEHOLDER'; // translation key

  @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();

  private previousSelectedValue: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.options && this.options.length > 0) {
      // When a placeholder is provided, do not auto-select the first option.
      // Instead, keep the selectedValue as empty so that the placeholder is shown.
      if (this.selectedValue === undefined || this.selectedValue === null) {
        this.selectedValue = '';  // Leave empty to match the placeholder option's value.
        this.selectedValueChange.emit(this.selectedValue);
      }
    }
    // if (changes['selectedLanguage'] && !changes['selectedLanguage'].firstChange) {
    //   this.updateSelectedValueForLanguage();
    // }
  }

  // private updateSelectedValueForLanguage(): void {
  //   if (this.previousSelectedValue) {
  //     const matchingOption = this.options.find(option => option.key === this.previousSelectedValue);
  //     if (matchingOption) {
  //       this.selectedValue = matchingOption.key;
  //       this.selectedValueChange.emit(this.selectedValue);
  //     }
  //   }
  // }

  onValueChange(newValue: any): void {
    this.previousSelectedValue = newValue;
    this.selectedValue = newValue;
    this.selectedValueChange.emit(newValue);
  }
}