export const searchGroupFields = [
    {
        groupTitle: "Saved Groups",
        groupFields: [
            {
                "title": "Copy of Testing",
                "fields": [{ parent: "System Fields", field: "Copy", operator: "yes", value: "" },
                { parent: "System Fields", field: "Copy", operator: "no", value: "" },
                { parent: "System Fields", field: "Date", operator: "equals", value: "11-02-2025" },
                ]
            },
            {
                "title": "Testing345",
                "fields": [{ parent: "System Fields", field: "Name", operator: "contains", value: "" },
                { parent: "System Fields", field: "Age", operator: "empty", value: "active" },
                { parent: "System Fields", field: "Date", operator: "End-On", value: "2025-02-11" },
                ],
            },
            {
                "title": "Testing678",
                "fields": [{ parent: "System Fields", field: "Name", operator: "contains", value: "" },
                { parent: "System Fields", field: "Age", operator: "equals", value: "active" },
                ],
            }
        ]
    }
];
