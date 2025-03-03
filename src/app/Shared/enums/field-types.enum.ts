export enum FieldType {
  Bool = 'bool',
  Text = 'text',
  Date = 'date',
  Number = 'number',
  Dropdown = 'dropdown'
}

// Sets of fields
const NumericFields = ['version', 'priority'];
const StringFields = ['edit', 'state', 'user', 'brand', 'input', 'visual', 'description', 'status'];
const DateFields = ['date','current'];
const DropdownFields = ['copy', 'category'];

// Numeric fields set
export const NumericFieldMapping: { [key: string]: FieldType } = Object.fromEntries(
  NumericFields.map(field => [field, FieldType.Number])
);

// String fields set
export const StringFieldMapping: { [key: string]: FieldType } = Object.fromEntries(
  StringFields.map(field => [field, FieldType.Text])
);

// Date fields set
export const DateFieldMapping: { [key: string]: FieldType } = Object.fromEntries(
  DateFields.map(field => [field, FieldType.Date])
);

// Dropdown fields set
export const DropdownFieldMapping: { [key: string]: FieldType } = Object.fromEntries(
  DropdownFields.map(field => [field, FieldType.Dropdown])
);

// Combined field type mapping for easy lookup
export const FieldTypeMapping: { [key: string]: FieldType } = {
  ...NumericFieldMapping,
  ...StringFieldMapping,
  ...DateFieldMapping,
  ...DropdownFieldMapping
};