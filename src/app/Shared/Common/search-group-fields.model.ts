export interface Field {
    parent: string;
    field: string;
    operator: string;
    value: string;
}

export interface GroupField {
    title: string;
    fields: Field[];
}

export interface SearchGroup {
    groupTitle: string;
    groupFields: GroupField[];
}
