export enum FieldType {
  Bool = 'bool',
  Text = 'text',
  Date = 'date',
  Number = 'number',
  Dropdown = 'dropdown'
}

export const FieldTypeMapping: { [key: string]: FieldType } = {
  copy: FieldType.Bool,
  current: FieldType.Bool,
  deleted: FieldType.Bool,
  edit: FieldType.Text,
  state: FieldType.Text,
  user: FieldType.Text,
  brand: FieldType.Text,
  date: FieldType.Date,
  version: FieldType.Number,
  input: FieldType.Text,
  visual: FieldType.Text,
  description: FieldType.Text,
  // Additional fields
  status: FieldType.Text,
  category: FieldType.Dropdown,
  priority: FieldType.Number
};