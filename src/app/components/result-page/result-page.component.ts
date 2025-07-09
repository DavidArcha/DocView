import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CustomButtonsComponent } from '../../Shared/components/custom-buttons/custom-buttons.component';
import { ResultPageService } from '../../Shared/services/result-page.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomModalService } from '../../Shared/components/custom-modal/custom-modal.service';
import { PaginationControlComponent } from '../../Shared/components/pagination/pagination-control/pagination-control.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { text } from 'express';
import { TextsurveyComponent } from '../../Shared/components/textsurvey/textsurvey.component';
import { CustomFooterComponentComponent } from '../../custom-footer-component/custom-footer-component.component';
import { CreateItemsComponent } from '../create-items/create-items.component';

@Component({
  selector: 'app-result-page',
  standalone: false,
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.scss'
})
export class ResultPageComponent implements OnInit {

  @ViewChild('myFooterTemplate') footerTemplate!: TemplateRef<any>;
  @ViewChild('customFooterTemplate') customFooterTemplate!: TemplateRef<any>;
  @ViewChild('advancedFooterTemplate') advancedFooterTemplate!: TemplateRef<any>;

  // Ag-Grid Fields
  public columnDefs: ColDef[] = [];
  public rowData: any;
  public gridApi!: GridApi;
  public paginationPageSize = 10;
  public paginatinonSizeSelector: number[] | boolean = [5, 10, 20, 50, 100];
  public selectedRows: any[] = [];
  public totalCount: number = 1000;
  public currentPage: number = 1;
  public pageSize: number = 25;

  // Control container state
  isControlCollapsed: boolean = false;

  // Icons
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  // Dropdown related fields
  selectedMatch: any;
  selectedLanguage: string = 'de';
  selectedComponent: string = '';

  // Modal tracking for examples
  public lastSaved = new Date();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private resultPageService: ResultPageService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: CustomModalService
  ) {
    this.http
      .get('/assets/json/orders-list.json')
      .subscribe((data: any) => {
        this.rowData = data;
      });

    this.resultPageService.data$.subscribe(data => {
      console.log('Received data:', data);
    });
  }

  ngOnInit(): void {
    // Determine the initial component based on the URL snapshot.
    const urlSegments = this.route.snapshot.url;
    let newComponent = '';
    if (urlSegments.length > 1) {
      const secondSegment = urlSegments[1].path;
      if (secondSegment === 'TextSurvey') {
        newComponent = 'TextSurvey';
      } else if (secondSegment === 'SimpleSearch') {
        newComponent = 'SimpleSearch';
      } else if (secondSegment === 'Test') {
        newComponent = 'Test';
      } else if (secondSegment === 'TestDD') {
        newComponent = 'TestDD';
      } else if (secondSegment === 'TestACC') {
        newComponent = 'TestACC';
      } else if (secondSegment === 'TestModel') {
        newComponent = 'TestModel';
      }
    }
    this.displayComponent(newComponent);

    // Subscribe to further route changes.
    this.route.url.subscribe(url => {
      const pathSegment = url[1]?.path || '';
      let updatedComponent = '';
      if (pathSegment === 'TextSurvey') {
        updatedComponent = 'TextSurvey';
      } else if (pathSegment === 'SimpleSearch') {
        updatedComponent = 'SimpleSearch';
      } else if (pathSegment === 'Test') {
        updatedComponent = 'Test';
      } else if (pathSegment === 'TestDD') {
        updatedComponent = 'TestDD';
      } else if (pathSegment === 'TestACC') {
        updatedComponent = 'TestACC';
      } else if (pathSegment === 'SelectSearch') {
        updatedComponent = 'SelectSearch';
      } else if (pathSegment === 'TestModel') {
        updatedComponent = 'TestModel';
      }
      if (updatedComponent !== this.selectedComponent) {
        this.displayComponent(updatedComponent);
      }
    });
  }

  displayComponent(component: string): void {
    const storedComponent = localStorage.getItem('selectedComponent');

    if (component && storedComponent && component !== storedComponent) {
      this.isControlCollapsed = false;
      localStorage.setItem('isControlCollapsed', 'false');
    } else if (component && (!storedComponent || component === storedComponent)) {
      const savedCollapse = localStorage.getItem('isControlCollapsed');
      if (savedCollapse !== null) {
        this.isControlCollapsed = savedCollapse === 'true';
      } else {
        this.isControlCollapsed = false;
        localStorage.setItem('isControlCollapsed', 'false');
      }
    }
    this.selectedComponent = component;
    localStorage.setItem('selectedComponent', component);
  }

  toggleControlContainer(): void {
    this.isControlCollapsed = !this.isControlCollapsed;
    localStorage.setItem('isControlCollapsed', this.isControlCollapsed.toString());
    this.cdr.detectChanges();
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
    }
  }

  clearSelection(): void {
    this.gridApi.deselectAll();
    this.selectedRows = [];
  }

  onPageChanged(zeroBasedPage: number) {
    this.currentPage = zeroBasedPage + 1;
    console.log(`Current page changed to: ${this.currentPage}`);
  }

  onPageSizeChanged(size: number) {
    this.pageSize = size;
    console.log(`Page size changed to: ${this.pageSize}`);
  }

  // ============================================================================
  // MODAL USAGE EXAMPLES - All integrated examples
  // ============================================================================

  // Example 1: Auto-size modal with template footer
  openAutoSizeModal() {
    const modalRef = this.modalService.open({
      component: CreateItemsComponent,
      title: 'Auto-size Document Viewer Auto-size Document Viewer Auto-size Document Viewer',
      middleText: 'Page 1 of 10',
      preActionText: 'Saved',
      headerColor: '#2c3e50',
      draggable: true,
      footerTemplate: this.footerTemplate,
      footerData: { saveEnabled: true },
      autoSize: true,
      minWidth: '400px',
      maxWidth: '800px',
      minHeight: '300px',
      maxHeight: '700px',
      allowBackgroundInteraction: true,
      closeOnBackdropClick: false,
      closeOnEscape: true
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Auto-size modal closed with result:', result);
    });
  }

  // Example 2: Fixed size blocking modal
  openFixedSizeModal() {
    const modalRef = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Fixed Size Modal',
      headerColor: '#e74c3c',
      draggable: true,
      width: '800px',
      height: '600px',
      allowBackgroundInteraction: false, // Blocking modal
      closeOnBackdropClick: true,
      closeOnEscape: true,
      showFooter: false // No footer
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Fixed size modal closed with result:', result);
    });
  }

  // Example 3: Width-only modal (height auto-adjusts)
  openWidthOnlyModal() {
    const modalRef = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Width-only Modal',
      headerColor: '#9b59b6',
      draggable: true,
      width: '600px', // Only width specified
      footerComponent: CustomFooterComponentComponent,
      footerData: {
        buttons: ['Save', 'Cancel', 'Apply'],
        showProgress: true
      },
      allowBackgroundInteraction: true
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Width-only modal closed with result:', result);
    });
  }

  // Example 4: Height-only modal (width auto-adjusts)
  openHeightOnlyModal() {
    const modalRef = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Height-only Modal',
      headerColor: '#3498db',
      draggable: true,
      height: '500px', // Only height specified
      footerTemplate: this.customFooterTemplate,
      footerData: {
        message: 'Custom template footer',
        lastSaved: this.lastSaved
      },
      allowBackgroundInteraction: true
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Height-only modal closed with result:', result);
    });
  }

  // Example 5: Parent-child with minimize behavior
  openParentChildMinimizeModal() {
    const parentModal = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Parent Modal',
      headerColor: '#27ae60',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '600px',
      height: '400px',
      childMinimizeBehavior: 'minimize', // Children minimize with parent
      footerTemplate: this.advancedFooterTemplate,
      footerData: {
        type: 'parent',
        childCount: 0
      }
    });

    // Child modal 1
    const childModal1 = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Child Modal 1',
      headerColor: '#2ecc71',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '500px',
      height: '350px',
      footerTemplate: this.advancedFooterTemplate,
      footerData: {
        type: 'child',
        parentTitle: 'Parent Modal'
      }
    }, parentModal);

    // Child modal 2
    const childModal2 = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Child Modal 2',
      headerColor: '#2ecc71',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '450px',
      height: '300px',
      footerTemplate: this.advancedFooterTemplate,
      footerData: {
        type: 'child',
        parentTitle: 'Parent Modal'
      }
    }, parentModal);

    parentModal.afterClosed().subscribe(result => {
      console.log('Parent modal closed with result:', result);
    });
  }

  // Example 6: Parent-child with close behavior
  openParentChildCloseModal() {
    const parentModal = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Parent Modal (Close Children)',
      headerColor: '#e67e22',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '600px',
      height: '400px',
      childMinimizeBehavior: 'close', // Children close when parent minimizes
      closeChildrenOnParentClose: true
    });

    const childModal = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Child Modal (Will Close)',
      headerColor: '#f39c12',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '500px',
      height: '350px'
    }, parentModal);

    parentModal.afterClosed().subscribe(result => {
      console.log('Parent modal (close behavior) closed with result:', result);
    });
  }

  // Example 7: Independent child behavior
  openParentChildIndependentModal() {
    const parentModal = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Parent Modal (Independent)',
      headerColor: '#8e44ad',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '600px',
      height: '400px',
      childMinimizeBehavior: 'none' // Children remain independent
    });

    const childModal = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Independent Child Modal',
      headerColor: '#9b59b6',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '500px',
      height: '350px'
    }, parentModal);

    parentModal.afterClosed().subscribe(result => {
      console.log('Parent modal (independent) closed with result:', result);
    });
  }

  // Example 8: Multiple non-blocking modals
  openMultipleModals() {
    // First modal
    const modal1 = this.modalService.open({
      component: TextsurveyComponent,
      title: 'First Modal',
      headerColor: '#1abc9c',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '600px',
      height: '400px',
      footerTemplate: this.customFooterTemplate,
      footerData: { message: 'Modal 1 Footer' }
    });

    // Second modal (will appear on top initially)
    const modal2 = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Second Modal',
      headerColor: '#16a085',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '500px',
      height: '350px',
      footerTemplate: this.customFooterTemplate,
      footerData: { message: 'Modal 2 Footer' }
    });

    // Third modal
    const modal3 = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Third Modal',
      headerColor: '#0f6f54',
      allowBackgroundInteraction: true,
      draggable: true,
      width: '450px',
      height: '300px',
      footerTemplate: this.customFooterTemplate,
      footerData: { message: 'Modal 3 Footer' }
    });

    // Demonstrate programmatic focus after 3 seconds
    setTimeout(() => {
      this.modalService.focusModal(modal1); // Brings modal1 to front
    }, 3000);
  }

  // Example 9: Constrained auto-size modal
  openConstrainedAutoSizeModal() {
    const modalRef = this.modalService.open({
      component: TextsurveyComponent,
      title: 'Constrained Auto-size Modal',
      headerColor: '#34495e',
      draggable: true,
      autoSize: true,
      minWidth: '400px',
      maxWidth: '80vw',
      minHeight: '300px',
      maxHeight: '80vh',
      allowBackgroundInteraction: true,
      footerComponent: CustomFooterComponentComponent,
      footerData: {
        buttons: ['Resize Content', 'Save', 'Cancel']
      }
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Constrained auto-size modal closed with result:', result);
    });
  }

  // Example 10: No footer modal
  openNoFooterModal() {
    const modalRef = this.modalService.open({
      component: TextsurveyComponent,
      title: 'No Footer Modal',
      middleText: 'Clean Layout',
      headerColor: '#95a5a6',
      draggable: true,
      width: '500px',
      height: '400px',
      allowBackgroundInteraction: true
      // No footer properties - footer will not show
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('No footer modal closed with result:', result);
    });
  }

  // Helper methods for footer templates
  save() {
    this.lastSaved = new Date();
    console.log('Document saved at:', this.lastSaved);
  }

  cancel(modalRef: any) {
    modalRef.close('cancelled');
  }

  apply() {
    console.log('Changes applied');
  }

  closeAllModals() {
    this.modalService.closeAll();
  }
}
