import { Component, Input } from '@angular/core';
import { ModalRef } from '../../Shared/components/custom-modal/modal-ref';

@Component({
  selector: 'app-testing-form',
  standalone: false,
  templateUrl: './testing-form.component.html',
  styleUrl: './testing-form.component.scss'
})
export class TestingFormComponent {
  @Input() modalRef?: ModalRef; // Injected modal reference

  // Properties to bind to the textboxes
  textbox1Value: string = '';
  textbox2Value: string = '';

  constructor() {
    // Set initial values if modal exists
    this.updateModalHeader();
  }

  // Method to handle textbox1 changes and update modal title
  onTextbox1Change() {
    this.updateModalHeader();
  }

  // Method to handle textbox2 changes and update modal preActionText
  onTextbox2Change() {
    this.updateModalHeader();
  }

  // Update modal header based on current textbox values
  private updateModalHeader() {
    if (this.modalRef) {
      this.modalRef.updateHeader({
        title: this.textbox1Value || 'Testing Form',
        middleText: this.getCombinedText(),
        preActionText: this.textbox2Value || 'Enter values'
      });
    }
  }

  // Get combined text for middle section
  private getCombinedText(): string {
    if (this.textbox1Value && this.textbox2Value) {
      return `${this.textbox1Value} + ${this.textbox2Value}`;
    } else if (this.textbox1Value) {
      return `Input: ${this.textbox1Value}`;
    } else if (this.textbox2Value) {
      return `Value: ${this.textbox2Value}`;
    }
    return 'Enter data to see updates';
  }

  // Method to handle button click
  onButtonClick() {
    console.log('Button clicked!');
    console.log('Textbox 1 Value:', this.textbox1Value);
    console.log('Textbox 2 Value:', this.textbox2Value);
    
    // Update modal header with submitted values
    if (this.modalRef) {
      this.modalRef.updateHeader({
        title: `Submitted: ${this.textbox1Value}`,
        middleText: 'Form Submitted Successfully!',
        preActionText: `Result: ${this.textbox2Value}`
      });
    }
    
    // You can add your logic here
    if (this.textbox1Value && this.textbox2Value) {
      alert(`Textbox 1: ${this.textbox1Value}\nTextbox 2: ${this.textbox2Value}`);
    } else {
      alert('Please fill in both textboxes');
    }
  }

  // Method to clear both textboxes
  onClearClick() {
    this.textbox1Value = '';
    this.textbox2Value = '';
    
    // Reset modal header
    if (this.modalRef) {
      this.modalRef.updateHeader({
        title: 'Testing Form',
        middleText: 'Enter data to see updates',
        preActionText: 'Enter values'
      });
    }
  }

  // Method to demonstrate individual updates
  updateTitleOnly() {
    if (this.modalRef && this.textbox1Value) {
      this.modalRef.updateTitle(`Title: ${this.textbox1Value}`);
    }
  }

  updatePreActionOnly() {
    if (this.modalRef && this.textbox2Value) {
      this.modalRef.updatePreActionText(`Action: ${this.textbox2Value}`);
    }
  }
}
