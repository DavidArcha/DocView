import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CustomButtonsComponent } from '../../Shared/components/custom-buttons/custom-buttons.component';
import { ResultPageService } from '../../Shared/services/result-page.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  isControlCollapsed: boolean = false;
  // Icons
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  // Dropdown related fields
  selectedMatch: any;
  selectedLanguage: string = 'de';
  selectedComponent: string = ''; // Default to empty

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private resultPageService: ResultPageService, // Inject the service
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.http
      .get('/assets/json/orders-list.json')
      .subscribe((data: any) => {
        this.rowData = data;
      });

    this.resultPageService.data$.subscribe(data => {
      console.log('Received data:', data);
      // Handle the received data here
    });
  }

  ngOnInit(): void {

    // First, check if there is a saved component & collapse state in local storage
    const savedComponent = localStorage.getItem('selectedComponent');
    const savedCollapse = localStorage.getItem('isControlCollapsed');

    if (savedComponent) {
      this.selectedComponent = savedComponent;
      this.isControlCollapsed = savedCollapse === 'true';
    }

    // Listen to route changes to update the component being displayed.
    // When switching components, we want the container to open by default.
    this.route.url.subscribe(urlSegments => {
      const pathSegment = urlSegments[1]?.path;
      let newComponent = '';
      if (pathSegment === 'TextSurvey') {
        newComponent = 'TextSurvey';
      } else if (pathSegment === 'SimpleSearch') {
        newComponent = 'SimpleSearch';
      }

      // If a new component is selected (or no component is selected)
      if (newComponent && newComponent !== this.selectedComponent) {
        this.displayComponent(newComponent);
      }
    });

    // const savedSelection = localStorage.getItem('selectedComponent');
    // if (savedSelection) {
    //   this.selectedComponent = savedSelection;
    // }
  }

  ngOnChanges(): void {
    localStorage.setItem('selectedComponent', this.selectedComponent);
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

  /**
   * Toggle the collapse state and save the state in local storage.
   * This ensures that if the user refreshes, the container retains the last state.
   */
  toggleControlContainer(): void {
    this.isControlCollapsed = !this.isControlCollapsed;
    localStorage.setItem('isControlCollapsed', this.isControlCollapsed.toString());
    this.cdr.detectChanges();
  }

   /**
   * Called when switching to a new component (e.g. SS to TS).
   * Sets the container to open (not collapsed) and updates local storage.
   */
   displayComponent(component: string): void {
    this.selectedComponent = component;
    // Open the container on component switch
    this.isControlCollapsed = false;
    localStorage.setItem('selectedComponent', component);
    localStorage.setItem('isControlCollapsed', 'false');
  }
}
