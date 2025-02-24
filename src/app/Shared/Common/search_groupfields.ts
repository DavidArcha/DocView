export const searchGroupFields = [
    {
        groupTitle: { id: 'saved_group', title: "Saved Groups" },
        groupFields: [
            {
                "title": { id: 'copy_of_testing', title: "Copy of Testing" },
                "fields": [{ id: 'copy', parent: "System Fields", field: "Copy", operator: "yes", value: "" },
                { id: 'date', parent: "System Fields", field: "Date", operator: "equals", value: "11-02-2025" },
                ]
            },
            {
                "title": { id: 'testing345', title: "Testing345" },
                "fields": [{ id: 'name', parent: "System Fields", field: "Name", operator: "contains", value: "" },
                { id: 'age', parent: "System Fields", field: "Age", operator: "empty", value: "active" },
                { id: "date", parent: "System Fields", field: "Date", operator: "End-On", value: "2025-02-11" },
                ],
            },
            {
                "title": { id: 'testing678', title: "Testing678" },
                "fields": [{ id: 'name', parent: "System Fields", field: "Name", operator: "contains", value: "" },
                { id: 'age', parent: "System Fields", field: "Age", operator: "equals", value: "active" },
                ],
            }
        ]
    }
];
