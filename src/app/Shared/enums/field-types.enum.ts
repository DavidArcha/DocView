export enum FieldType {
  Bool = 'bool',
  Text = 'text',
  Date = 'date',
  Number = 'number',
  Dropdown = 'dropdown'
}

// Sets of fields
const NumericFields = ['version', 'priority', 'edit'];
const StringFields = ['state', 'user', 'visual', 'description', 'status'];
const DateFields = ['current', 'date'];
const DropdownFields = ['category', 'copy', 'user', 'brand'];

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

// Mapping for dropdown fields to their data sources
export const DropdownDataMapping: { [key: string]: string } = {
  'copy': 'brandData',
  'category': 'stateData'
};

// Combined field type mapping for easy lookup
export const FieldTypeMapping: { [key: string]: FieldType } = {
  ...NumericFieldMapping,
  ...StringFieldMapping,
  ...DateFieldMapping,
  ...DropdownFieldMapping
};