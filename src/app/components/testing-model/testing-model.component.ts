import { Component } from '@angular/core';
import { CustomModalService } from '../../Shared/components/custom-modal/custom-modal.service';
import { TestingFormComponent } from '../testing-form/testing-form.component';

@Component({
  selector: 'app-testing-model',
  standalone: false,

  templateUrl: './testing-model.component.html',
  styleUrl: './testing-model.component.scss'
})
export class TestingModelComponent {

  constructor(private modalService: CustomModalService) { }

  openAutoSizeModal(input1?: string, input2?: string) {
    const modalRef = this.modalService.open({
      component: TestingFormComponent,
      title: 'New',
      preActionText: 'Saved',
      headerColor: '#2c3e50',
      draggable: true,
      autoSize: true,
      minWidth: '400px',
      maxWidth: '800px',
      minHeight: '300px',
      maxHeight: '700px',
      allowBackgroundInteraction: true,
      closeOnBackdropClick: false,
      closeOnEscape: true,
      data: {
        Input1: input1 || 'Default Value 1',
        Input2: input2 || 'Default Value 2'
      }
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Auto-size modal closed with result:', result);
    });
  }
}
