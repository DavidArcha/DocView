export const searchGroupFields = [
    {
        groupTitle: { id: 'saved_group', title: "Saved Groups" },
        groupFields: [
            {
                "title": { id: 'copy_of_testing', title: "Copy of Testing" },
                "fields": [{
                    "parent": {
                        id: "1",
                        label: "Windows-EN"
                    },
                    "field": {
                        id: "ST-EN-1",
                        label: "ST-EN-1"
                    },
                    "operator": {
                        id: "equals",
                        label: "equals"
                    },
                    "value": "12345"
                },
                {
                    "parent": {
                        id: "1",
                        label: "Windows-EN"
                    },
                    "field": {
                        id: "ST-EN-2",
                        label: "ST-EN-2"
                    },
                    "operator": {
                        id: "equals",
                        label: "equals"
                    },
                    "value": "12345"
                }
                ]
            }
        ]
    }
];
