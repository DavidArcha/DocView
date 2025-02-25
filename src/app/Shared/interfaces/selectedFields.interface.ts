export interface SelectedField {
    parent: { id: string; label: string };
    field: { id: string; label: string };
    operator: string;
    operatorOptions: any[];
    value: any;
    operatorTouched?: boolean;
    valueTouched?: boolean | boolean[];
}