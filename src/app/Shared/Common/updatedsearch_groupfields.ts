export const updatedSearchGroupFields = [
    {
        groupTitle: { id: 'saved_group', label: "Saved Groups" },
        groupFields: [
            {
                title: {
                    id: "98765",
                    label: "Search Request"
                },
                fields: [
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
                title: {
                    id: "9876590",
                    label: "Search Request - 2"
                },
                fields: [
                    {
                        rowId: "",
                        parent: {
                            id: "1",
                            label: "Windows-EN"
                        },
                        field: {
                            id: "ST-EN-2",
                            label: "ST-EN-2"
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
        ]
    }
];
