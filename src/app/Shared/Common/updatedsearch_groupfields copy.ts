export const updatedSearchGroupFields = [
    {
        groupTitle: { id: 'saved_group', title: "Saved Groups" },
        groupFields: [
            {
                title: {
                    id: "98765",
                    label: "Search Request"
                },
                "fields": [
                    {
                        rowId: "",
                        parent: {
                            id: "1",
                            label: "Windows-EN"
                        },
                        field: {
                            id: "ST-EN-1",
                            label: "ST-EN-1"
                        },
                        operator: {
                            id: "equals",
                            label: "equals"
                        },
                        value: "1234567"
                    },
                    {
                        rowId: "",
                        parent: [
                            {
                                id: 4,
                                label: "Azure-EN"
                            },
                            {
                                id: 5,
                                label: "AWS-EN"
                            },
                            {
                                id: 3,
                                label: "Google-EN"
                            }
                        ],
                        field: {
                            id: "Age",
                            label: "Age"
                        },
                        operator: {
                            id: "equals",
                            label: "equals"
                        },
                        value: 123456
                    },
                    {
                        rowId: "",
                    parent: {
                            id: "2",
                            label: "Linux-EN"
                        },
                        field: {
                            id: "ST-EN-4",
                            label: "ST-EN-4"
                        },
                        operator: {
                            id: "between",
                            label: "between"
                        },
                        value: "Testing1-Testing2"
                    }
                ]
            },
            {
                "title": {
                    "id": "123456",
                    "label": "Testing Single Values"
                },
                "fields": [
                    {
                        "rowId": "",
                        "parent": {
                            "id": "1",
                            "label": "Windows-EN"
                        },
                        "field": {
                            "id": "Name",
                            "label": "Name"
                        },
                        "operator": {
                            "id": "not_equals",
                            "label": "not equals"
                        },
                        "value": "23"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "1",
                            "label": "Windows-EN"
                        },
                        "field": {
                            "id": "BT-EN-1",
                            "label": "BT-EN-1"
                        },
                        "operator": {
                            "id": "equals",
                            "label": "equals"
                        },
                        "value": "BT-EN-1 selected at 3:25:35 PM"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "1",
                            "label": "Windows-EN"
                        },
                        "field": {
                            "id": "DT-EN-1",
                            "label": "DT-EN-1"
                        },
                        "operator": {
                            "id": "equals",
                            "label": "equals"
                        },
                        "value": "2025-03-14"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "1",
                            "label": "Windows-EN"
                        },
                        "field": {
                            "id": "DD-EN-1",
                            "label": "DD-EN-1"
                        },
                        "operator": {
                            "id": "equals",
                            "label": "equals"
                        },
                        "value": "byd"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "1",
                            "label": "Windows-EN"
                        },
                        "field": {
                            "id": "NO-EN-1",
                            "label": "NO-EN-1"
                        },
                        "operator": {
                            "id": "equals",
                            "label": "equals"
                        },
                        "value": 22
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "1",
                            "label": "Windows-EN"
                        },
                        "field": {
                            "id": "ST-EN-1",
                            "label": "ST-EN-1"
                        },
                        "operator": {
                            "id": "equals",
                            "label": "equals"
                        },
                        "value": "123"
                    }
                ]
            },
            {
                "title": {
                    "id": "56789",
                    "label": "Testing Double values"
                },
                "fields": [
                    {
                        "rowId": "",
                        "parent": {
                            "id": "3",
                            "label": "Google-EN"
                        },
                        "field": {
                            "id": "Age",
                            "label": "Age"
                        },
                        "operator": {
                            "id": "between",
                            "label": "between"
                        },
                        "value": "321-654"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "3",
                            "label": "Google-EN"
                        },
                        "field": {
                            "id": "BT-EN-6",
                            "label": "BT-EN-6"
                        },
                        "operator": {
                            "id": "between",
                            "label": "between"
                        },
                        "value": "Option 1 - BT-EN-6 selected at 3:28:33 PM-Option 2 - BT-EN-6 selected at 3:28:43 PM"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "3",
                            "label": "Google-EN"
                        },
                        "field": {
                            "id": "DT-EN-5",
                            "label": "DT-EN-5"
                        },
                        "operator": {
                            "id": "between",
                            "label": "between"
                        },
                        "value": "2025-03-01-2025-03-14"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "3",
                            "label": "Google-EN"
                        },
                        "field": {
                            "id": "DD-EN-5",
                            "label": "DD-EN-5"
                        },
                        "operator": {
                            "id": "between",
                            "label": "between"
                        },
                        "value": "bmw-byd"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "3",
                            "label": "Google-EN"
                        },
                        "field": {
                            "id": "NO-EN-5",
                            "label": "NO-EN-5"
                        },
                        "operator": {
                            "id": "between",
                            "label": "between"
                        },
                        "value": "123-456"
                    },
                    {
                        "rowId": "",
                        "parent": {
                            "id": "3",
                            "label": "Google-EN"
                        },
                        "field": {
                            "id": "ST-EN-5",
                            "label": "ST-EN-5"
                        },
                        "operator": {
                            "id": "between",
                            "label": "between"
                        },
                        "value": "test-1-test-2"
                    }
                ]
            }
        ]
    }
];
