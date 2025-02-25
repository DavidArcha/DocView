
export interface ListItem {
    id: string;
    label: string;
}

export interface TableItem extends ListItem {
    column1: string;
    column2: string;
}