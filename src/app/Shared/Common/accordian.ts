export const accordionDataTypes =
  [
    { id: 'w', label: 'world', children: [] },
    {
      id: 'system_fields', label: 'System Fields', children: [
        { id: 'copy', label: 'Copy', children: [] },
        { id: 'current', label: 'Current', children: [] },
        { id: 'edit', label: 'Edit', children: [] },
        { id: 'state', label: 'State', children: [] },
      ]
    },
    {
      id: 'data_fields', label: 'Data Fields', children: [
        { id: 'date', label: 'Date', children: [] },
        { id: 'user', label: 'User', children: [] },
        { id: 'version', label: 'Version', children: [] },
      ]
    },
    {
      id: 'division', label: 'Division', children: [
        { id: 'delete', label: 'Delete', children: [] },
        {
          id: 'division-1', label: 'Devision-1', children: [
            { id: 'id', label: 'ID', children: [] },
            { id: 'input', label: 'Input', children: [] },
          ]
        },
        {
          id: 'division-2', label: 'Devision-2', children: [
            { id: 'visual', label: 'Visual', children: [] },
            { id: 'brand', label: 'Brand', children: [] },
            { id: 'description', label: 'Description', children: [] },
          ]
        }
      ]
    },
    {
      id: 'category', label: 'Category', children: [
        {
          id: 'subcat-1', label: 'SubCat-1', children: [
            { id: 'visual', label: 'Visual', children: [] },
            { id: 'description', label: 'Description', children: [] },
            { id: 'delete', label: 'Delete', children: [] },
          ]
        },
        {
          id: 'subcat-2', label: 'SubCat-2', children: [
            { id: 'user', label: 'User', children: [] },
            { id: 'copy', label: 'Copy', children: [] },
            { id: 'state', label: 'State', children: [] },
          ]
        },
      ]
    }
  ]  
