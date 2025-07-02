import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ResultPageComponent } from './components/result-page/result-page.component';
import { SideNavbarComponent } from './Shared/components/side-navbar/side-navbar.component';
import { SimpleSearchComponent } from './Shared/components/simple-search/simple-search.component';
import { LanguageService } from './Shared/services/language.service';
import { HomepageComponent } from './components/HomePage/homepage.component';
import { HeaderComponent } from './components/header/header.component';
import { CustomButtonsComponent } from './Shared/components/custom-buttons/custom-buttons.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LocalizedDropdownComponent } from './Shared/components/dropdownControl/localized-dropdown/localized-dropdown.component';
import { AccordionSectionComponent } from './Shared/components/accordionControl/accordion-section/accordion-section.component';
import { SavedGroupAccordionComponent } from './Shared/components/accordionControl/saved-group-accordion/saved-group-accordion.component';
import { TextsurveyComponent } from './Shared/components/textsurvey/textsurvey.component';
import { QueryTableComponent } from './Shared/components/query-table/query-table.component';
import { VideoPlayerComponent } from './Shared/components/video-player/video-player.component';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestingLevelComponent } from './Shared/components/testing-level/testing-level.component';
import { TestingDropdownComponent } from './Shared/components/dropdownControl/testing-dropdown/testing-dropdown.component';
import { TestingAccordionComponent } from './Shared/components/accordionControl/testing-accordion/testing-accordion.component';
import { MultilevelAccordionComponent } from './Shared/components/accordionControl/multilevel-accordion/multilevel-accordion.component';
import { TableDropdownComponent } from './Shared/components/dropdownControl/table-dropdown/table-dropdown.component';
import { SelectSearchComponent } from './Shared/components/side-components/select-search/select-search.component';
import { RelationTableComponent } from './Shared/components/relation-table/relation-table.component';
import { PaginationControlComponent } from './Shared/components/pagination/pagination-control/pagination-control.component';
import { CustomModalContainerComponent } from './Shared/components/custom-modal/custom-modal-container/custom-modal-container.component';
import { CustomModalPopupComponent } from './Shared/components/custom-modal/custom-modal-popup/custom-modal-popup.component';
import { CustomFooterComponentComponent } from './custom-footer-component/custom-footer-component.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    HeaderComponent,
    SideNavbarComponent,
    NotFoundComponent,
    DashboardComponent,
    SimpleSearchComponent,
    ResultPageComponent,
    CustomButtonsComponent,
    LocalizedDropdownComponent,
    MultilevelAccordionComponent,
    AccordionSectionComponent,
    SavedGroupAccordionComponent,
    TextsurveyComponent,
    QueryTableComponent,
    VideoPlayerComponent,
    TestingLevelComponent,
    TableDropdownComponent,
    TestingDropdownComponent,
    TestingAccordionComponent,
    SelectSearchComponent,
    RelationTableComponent,
    PaginationControlComponent,
    CustomModalContainerComponent,
    CustomModalPopupComponent,
    CustomFooterComponentComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    RouterOutlet,
    AgGridModule,
    FontAwesomeModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [LanguageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}
