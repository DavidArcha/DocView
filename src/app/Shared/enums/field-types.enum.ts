export enum FieldType {
  Bool = 'bool',
  Text = 'text',
  Date = 'date',
  Number = 'number',
  Dropdown = 'dropdown'
}

// Sets of fields
const NumericFields = ['NO-EN-1', 'NO-EN-2', 'NO-EN-3', 'NO-EN-4', 'NO-EN-5', 'NO-EN-6', 'NO-EN-7', 'NO-EN-8', 'NO-EN-9', 'NO-EN-10'];
const StringFields = ['ST-EN-1', 'ST-EN-2', 'ST-EN-3', 'ST-EN-4', 'ST-EN-5', 'ST-EN-6', 'ST-EN-7', 'ST-EN-8', 'ST-EN-9', 'ST-EN-10'];
const DateFields = ['DT-EN-1', 'DT-EN-2', 'DT-EN-3', 'DT-EN-4', 'DT-EN-5', 'DT-EN-6', 'DT-EN-7', 'DT-EN-8', 'DT-EN-9', 'DT-EN-10'];
const DropdownFields = ['DD-EN-1', 'DD-EN-2', 'DD-EN-3', 'DD-EN-4', 'DD-EN-5', 'DD-EN-6', 'DD-EN-7', 'DD-EN-8', 'DD-EN-9', 'DD-EN-10'];

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