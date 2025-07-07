import { Component } from '@angular/core';
import { DynamicField } from '../../Shared/components/Custom-field/dynamic-fields/dynamic-fields.component';

@Component({
  selector: 'app-create-items',
  standalone: false,

  templateUrl: './create-items.component.html',
  styleUrl: './create-items.component.scss'
})
export class CreateItemsComponent {

  fields: DynamicField[] = [
    {
      id: 'name',
      label: 'Name',
      controlType: 'textbox',
      sortKey: 1,
      languageTranslator: false,
      multiEditorFlag: false,
      multiEditorValue: null,
      value: '',
      valueEn: ''
    },
    {
      id: 'phone',
      label: 'Phone',
      controlType: 'textbox',
      sortKey: 2,
      languageTranslator: false,
      multiEditorFlag: false,
      multiEditorValue: null,
      value: '',
      valueEn: ''
    },
    {
      id: 'type',
      label: 'Select Type',
      controlType: 'dropdown',
      sortKey: 3,
      languageTranslator: false,
      multiEditorFlag: false,
      multiEditorValue: null,
      value: '',
      valueEn: '',
      options: [
        { value: 'a', label: 'Type A' },
        { value: 'b', label: 'Type B' }
      ]
    },
        {
      id: "1",
      label: 'Select Type-1',
      controlType: 'dropdown',
      sortKey: 3,
      languageTranslator: false,
      multiEditorFlag: false,
      multiEditorValue: null,
      value: '',
      valueEn: '',
      options: [
        { value: 'a', label: 'Type A' },
        { value: 'b', label: 'Type B' }
      ]
    }
    // ... add more fields
  ];

  onFieldsChange(updatedFields: DynamicField[]) {
    // Handle the updated form data here!
    // For example: save to model, validate, or send to API
    console.log('Form changed:', updatedFields);

    // Example: Save to model
    this.fields = [...updatedFields];
  }

}
