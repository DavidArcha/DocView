export enum OperatorType {
  Empty = 'empty',
  NotEmpty = 'not_empty',
  Yes = 'yes',
  No = 'no',
  Between = 'between',
  NotBetween = 'not_between',
  Similar = 'similar',
  ContainsDate = 'contains_date'
}

export const NoValueOperators = [
  OperatorType.Empty,
  OperatorType.NotEmpty,
  OperatorType.Yes,
  OperatorType.No
];

export const DualOperators = [
  OperatorType.Between,
  OperatorType.NotBetween,
  OperatorType.Similar,
  OperatorType.ContainsDate
];