import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-result-page',
  standalone: false,

  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.scss'
})
export class ResultPageComponent implements OnInit {

  //Ag-Grid Fields
  public columnDefs: ColDef[] = [];
  public rowData: any;
  public gridApi!: GridApi;
  public paginationPageSize = 10;
  public paginatinonSizeSelector: number[] | boolean = [5, 10, 20, 50, 100];
  public selectedRows: any[] = [];

  constructor(private http: HttpClient) {
    this.http
      .get('/assets/json/orders-list.json')
      .subscribe((data: any) => {
        this.rowData = data;
        console.log(data);
      });
  }

  ngOnInit(): void {
    this.columnDefs = [
      { headerName: 'Order Number', field: 'orderno' },
      { headerName: 'Track Number', field: 'ordertrackno' },
      { headerName: 'Date', field: 'labeldate' },
      { headerName: 'Customer Number', field: 'custno' },
      { headerName: 'Period ID', field: 'perid' },
      { headerName: 'Catalog', field: 'catlog' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Label Number', field: 'labelnumber' },
      {
        headerName: 'Download',
        field: 'download',
        checkboxSelection: true
      }
  ];
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  onSelectionChanged(): void {
    const selectedNodes = this.gridApi.getSelectedNodes();
    this.selectedRows = selectedNodes.map(node => ({
      orderno: node.data.orderno,
      ordertrackno: node.data.ordertrackno,
      perid: node.data.perid
    }));
  }

  checkAll(): void {
    this.gridApi.forEachNode(node => node.setSelected(true));
    this.onSelectionChanged();
  }

  downloadPdf(): void {
    if (this.selectedRows.length > 0) {
      console.log(this.selectedRows);
      // Implement the logic to download the selected rows as a PDF
    }
  }

  clearSelection(): void {
    this.gridApi.deselectAll();
    this.selectedRows = [];
  }
}
