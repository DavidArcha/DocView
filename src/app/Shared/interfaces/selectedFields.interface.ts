export interface SelectedField {
    parent: { id: string; label: string };
    field: { id: string; label: string };
    operator: { id: string; label: string };
    operatorOptions: any[];
    value: any;
    operatorTouched?: boolean;
    valueTouched?: boolean | boolean[];
    dropdownData?: any[]; 
}