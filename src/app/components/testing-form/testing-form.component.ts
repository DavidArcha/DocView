import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ModalRef } from '../../Shared/components/custom-modal/modal-ref';

@Component({
  selector: 'app-testing-form',
  standalone: false,
  templateUrl: './testing-form.component.html',
  styleUrl: './testing-form.component.scss'
})
export class TestingFormComponent implements OnInit, OnChanges {
  @Input() modalRef?: ModalRef; // Injected modal reference
  @Input() Input1?: string; // First input parameter
  @Input() Input2?: string; // Second input parameter

  // Properties to bind to the textboxes
  textbox1Value: string = '';
  textbox2Value: string = '';

  constructor() {
    // Initial setup will be done in ngOnInit
  }

  ngOnInit() {
    // Check if data was passed through modalRef (when opened via modal service)
    if (this.modalRef && (this.modalRef as any).data) {
      const data = (this.modalRef as any).data;
      if (data.Input1) {
        this.Input1 = data.Input1;
        this.textbox1Value = data.Input1;
      }
      if (data.Input2) {
        this.Input2 = data.Input2;
        this.textbox2Value = data.Input2;
      }
      
      console.log('TestingFormComponent received data via modalRef:');
      console.log('Input1:', this.Input1);
      console.log('Input2:', this.Input2);
    }
    // Also check for direct @Input properties (for standalone usage)
    else if (this.Input1 || this.Input2) {
      console.log('TestingFormComponent received input data via @Input:');
      console.log('Input1:', this.Input1);
      console.log('Input2:', this.Input2);
      
      if (this.Input1) {
        this.textbox1Value = this.Input1;
      }
      if (this.Input2) {
        this.textbox2Value = this.Input2;
      }
    }
    
    // Update modal header with the initial data
    this.updateModalHeader();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['Input1'] || changes['Input2']) {
      console.log('Input parameters changed:');
      if (changes['Input1']) {
        console.log('Input1 changed to:', changes['Input1'].currentValue);
      }
      if (changes['Input2']) {
        console.log('Input2 changed to:', changes['Input2'].currentValue);
      }
    }
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
